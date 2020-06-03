import { Button, Stack, StackItem } from '@patternfly/react-core';
import * as React from "react";
import { uploadTest } from "../services/analysis";
import { LocalFile } from '../services/chris_integration';

const CreateAnalysis: React.FC = () => {

  const openLocalFilePicker = (): Promise<LocalFile[]> => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.click();
    return new Promise(res => {
      input.onchange = async () => {
        if (input.files) {
          const files = Array.from(input.files).map(file => {
            return {
              name: file.name,
              blob: file
            };
          });
          res(files); // resolve
        }
      };
    });
  }

  const submitFile = () => {
    openLocalFilePicker().then((files: LocalFile[]) => {
      uploadTest(files)
    })
  }

  return (
    <Stack>
      <StackItem>Create a new predicative analysis</StackItem>
      <StackItem isFilled>

        <Button onClick={submitFile}>Choose File...</Button>
      </StackItem>
    </Stack>
  );
}

export { CreateAnalysis as CreateAnalysisSection };

