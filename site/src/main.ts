import "./style.css";
import type {} from "@atcute/atproto";

import { Client } from "@atcute/client";
import {
  AuthorizationError,
  OAuthUserAgent,
  configureOAuth,
  createAuthorizationUrl,
  finalizeAuthorization,
} from "@atcute/oauth-browser-client";
import { isActorIdentifier } from "@atcute/lexicons/syntax";

import {
  CompositeDidDocumentResolver,
  LocalActorResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
  XrpcHandleResolver,
} from "@atcute/identity-resolver";

function sleep(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}

async function App() {
  const clientId = import.meta.env.VITE_CIMD_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_CIMD_REDIRECT_URI;
  const scope = import.meta.env.VITE_CIMD_SCOPE;

  configureOAuth({
    metadata: {
      client_id: clientId,
      redirect_uri: redirectUri,
    },
    identityResolver: new LocalActorResolver({
      handleResolver: new XrpcHandleResolver({
        serviceUrl: "https://public.api.bsky.app",
      }),
      didDocumentResolver: new CompositeDidDocumentResolver({
        methods: {
          plc: new PlcDidDocumentResolver(),
          web: new WebDidDocumentResolver(),
        },
      }),
    }),
  });

  const requestInviteButton = document.getElementById("request-invite");
  const inviteModal = document.getElementById("request-invite-modal");
  const notificationModal = document.getElementById("notification");

  if (
    !requestInviteButton ||
    !(inviteModal instanceof HTMLDialogElement) ||
    !(notificationModal instanceof HTMLDialogElement)
  ) {
    return;
  }

  async function showNotification(text?: string) {
    const notificationModal = document.getElementById("notification");
    if (!(notificationModal instanceof HTMLDialogElement)) {
      return;
    }
    if (text) {
      notificationModal.innerText = text;
    }
    notificationModal.show();
    await sleep(2500);
    notificationModal.close();
  }

  requestInviteButton.addEventListener("click", (e) => {
    e.preventDefault();
    inviteModal.showModal();
  });

  const inviteForm = inviteModal.querySelector("form");
  if (!(inviteForm instanceof HTMLFormElement)) {
    console.error(
      "Expected inviteForm in #request-invite-modal > form to be present",
    );
    return;
  }

  const submitButton = inviteForm.querySelector('button[type="submit"]');
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  inviteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitButton.classList.add("disabled");
    inviteForm.setAttribute("disabled", "disabled");

    const formData = new FormData(inviteForm, submitButton);
    const handle = formData.get("handle");

    if (!handle || typeof handle !== "string" || !isActorIdentifier(handle)) {
      submitButton.classList.remove("disabled");
      inviteForm.removeAttribute("disabled");
      return;
    }

    try {
      const authUrl = await createAuthorizationUrl({
        target: { type: "account", identifier: handle },
        scope: scope,
      });

      // let browser persist local storage
      await sleep(200);

      // perform the redirect:
      window.location.assign(authUrl);
    } catch (err) {
      console.error(err);
      submitButton.classList.remove("disabled");
      inviteForm.removeAttribute("disabled");
    }
  });

  if (location.href.indexOf("#") > -1) {
    // server redirects with params in hash, not search string
    const params = new URLSearchParams(location.hash.slice(1));

    // scrub params from URL to prevent replay
    history.replaceState(null, "", location.pathname + location.search);

    const { session } = await finalizeAuthorization(params).catch((err) => {
      if (
        err instanceof AuthorizationError &&
        err.message.includes("rejected")
      ) {
        showNotification("You denied the authorization request.");
      } else {
        showNotification("An unknown error occurred.");
      }

      return { session: null };
    });

    if (!session) {
      return;
    }

    const agent = new OAuthUserAgent(session);
    const rpc = new Client({ handler: agent });

    try {
      const response = await rpc.post("com.atproto.repo.createRecord", {
        input: {
          repo: agent.sub,
          collection: "fyi.questionable.waitlist.request",
          rkey: "self",
          record: {
            $type: "fyi.questionable.waitlist.request",
            createdAt: new Date().toISOString(),
          },
        },
      });

      if (response.ok) {
        showNotification();
      }
    } catch (err) {
      showNotification("Failed to request invite, sorry!");
    }

    await agent.signOut();
  }
}

await App();
