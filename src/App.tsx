import { Suspense } from "react";
import { match } from "ts-pattern";
import { Routes, Route, useNavigate } from "react-router-dom";
import { QueryErrorResetBoundary } from "react-query";
import { ErrorBoundary } from "react-error-boundary";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import {
    Stack,
    Button,
    IDeskproClient,
    LoadingSpinner,
    useDeskproElements,
    useDeskproAppClient,
    useDeskproAppEvents,
} from "@deskpro/app-sdk";
import { deleteEntityContact } from "./services/entityAssociation";
import { Main } from "./pages/Main";
import { GlobalSignIn } from "./pages/GlobalSignIn";
import { HomePage } from "./pages/HomePage";
import { LinkPage } from "./pages/LinkPage";
import { DealPage } from "./pages/DealPage";
import { ActivityPage } from "./pages/ActivityPage";
import type { EventsPayload, DeskproUser } from "./types";
import type { Contact } from "./services/hubspot/types";

const unlink = (client: IDeskproClient|null, successFn: () => void) => (userId: DeskproUser["id"], contactId: Contact["id"]) => {
    if (client && userId && contactId) {
        deleteEntityContact(client, userId, contactId)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .then((isSuccess: boolean) => {
                if (isSuccess) {
                    successFn();
                }
            })
            .catch(() => {});
    }
};

function App() {
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const unlinkContact = unlink(client, () => navigate("/link"));

    useDeskproElements(({ registerElement }) => {
        registerElement("refreshButton", { type: "refresh_button" });
    });

    useDeskproAppEvents({
        onShow: () => {
            client && setTimeout(() => client.resize(), 200);
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onElementEvent: (id, type, payload: EventsPayload) => {
            match(payload.type)
                .with("changePage", () => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    payload?.path && navigate(payload.path);
                })
                .with("unlink", () => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    unlinkContact(payload?.userId, payload?.contactId);
                })
                .otherwise(() => {});
        },
    }, [client]);

    if (!client) {
        return (<LoadingSpinner/>);
    }

    return (
        <Suspense fallback={<LoadingSpinner/>}>
            <QueryErrorResetBoundary>
                {({ reset }) => (
                    <ErrorBoundary
                        onReset={reset}
                        fallbackRender={({ resetErrorBoundary }) => (
                            <Stack gap={6} vertical style={{ padding: "8px" }}>
                                There was an error!
                                <Button
                                    text="Reload"
                                    icon={faRefresh}
                                    intent="secondary"
                                    onClick={() => resetErrorBoundary()}
                                />
                            </Stack>
                        )}
                    >
                        <Routes>
                            <Route path="/">
                                <Route path="admin">
                                    <Route path="global-sign-in" element={<GlobalSignIn/>} />
                                </Route>
                            </Route>
                            <Route path="home" element={<HomePage/>} />
                            <Route path="link" element={<LinkPage/>} />
                            <Route path="deal/:dealId" element={<DealPage/>} />
                            <Route path="contacts/activities" element={<ActivityPage/>} />
                            <Route index element={<Main/>} />
                        </Routes>
                    </ErrorBoundary>
                )}
            </QueryErrorResetBoundary>
        </Suspense>
    );
}

export default App;
