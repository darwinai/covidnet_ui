import * as React from "react";
import { Stack, StackItem } from '@patternfly/react-core';

const CreateAnalysis = () =>{
    return (
        <Stack>
            <StackItem>Create a new predicative analysis</StackItem>
            <StackItem isFilled>Content</StackItem>
        </Stack>
    );
}

export { CreateAnalysis as CreateAnalysisSection }