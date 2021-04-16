import { Alert, PageSection, PageSectionVariants } from "@patternfly/react-core";
import React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import "./not-found.scss";

class NotFoundPage extends React.Component {

    render() {
        return (
            <Wrapper>
                <PageSection variant={PageSectionVariants.default}>
                    <Alert
                        aria-label="Page Not Found"
                        variant="danger"
                        title="Page Not Found!"  >
                        Page Not Found! Go <a href="/">Home</a>
                    </Alert>
                </PageSection>
            </Wrapper>
        );
    }
}

export { NotFoundPage as NotFound };
