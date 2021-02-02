import { DcmImage, PACSMainResponse } from "../context/reducers/dicomImagesReducer";

declare var process: {
    env: {
        REACT_APP_CHRIS_UI_PFDCM_URL: string,
    }
  };

class PACSIntegration {

    private static basePACSFilePath = 'SERVICES/PACS/covidnet/';

    static parseResponse(rawResponse: string) {
        let responseHeader = rawResponse.split('\r');

        // the 4th element of responseHeader contains the stringified JSON body return payload
        const responseBody = responseHeader[4];
        const responseJSON = JSON.parse(responseBody);
        return responseJSON;
    }

    static async queryPatientFiles(patientID: string | undefined): Promise<DcmImage[]> {
        const options: RequestInit = {
            method:         'POST',
            mode:           'cors',
            cache:          'no-cache',
            credentials:    'same-origin',
            headers:        {'Content-Type': 'text/plain'},
            redirect:       'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                action:"PACSinteract",
                meta:{
                    do:"query",
                    on:{PatientID: patientID},
                    PACS:"orthanc"
                }
            })
        }

        let patientData: DcmImage[] = [];
        const rawResponse = await fetch(process.env.REACT_APP_CHRIS_UI_PFDCM_URL, options);
        const textResponse = await rawResponse.text();
        const parsedResponse = PACSIntegration.parseResponse(textResponse);
        const data: PACSMainResponse[] = parsedResponse.query.data;
        
        data.forEach(study => {
            study.series.forEach(series => {
                patientData.push({
                    id: series.uid.value,
                    creation_date: series.StudyDate.value,
                    fname: this.basePACSFilePath + 'PatientF.dcm',
                    PatientID: series.PatientID.value,
                    PatientName: series.PatientName.value,
                    PatientBirthDate: series.PatientBirthDate.value,
                    PatientAge: series.PatientAge.value,
                    PatientSex: series.PatientSex.value,
                    StudyInstanceUID: series.StudyInstanceUID.value,
                    StudyDescription: series.StudyDescription.value,
                    SeriesInstanceUID: series.SeriesInstanceUID.value,
                    SeriesDescription: series.SeriesDescription.value,
                    Modality: series.Modality.value,
                    pacs_identifier: 'covidnet'
                })
            });
        });
        return patientData;
    }

    static async retrievePatientFiles(StudyInstanceUID: string | undefined, SeriesInstanceUID: string | undefined): Promise<boolean> {
        const options: RequestInit  = {
            method:         'POST',
            mode:           'cors',
            cache:          'no-cache',
            credentials:    'same-origin',
            headers:        {'Content-Type': 'text/plain'},
            redirect:       'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                action:"PACSinteract",
                meta:{
                    do:"retrieve",
                    on:{
                        StudyInstanceUID: StudyInstanceUID, 
                        SeriesInstanceUID: SeriesInstanceUID
                    },
                        PACS:"orthanc"
                    }
                })
        };

        interface RetrieveResponse {
            status: boolean;
            retrieve: {
                status: string;
                data: any[];
                command: string;
                returncode: number;
            }
        }

        const rawResponse = await fetch(process.env.REACT_APP_CHRIS_UI_PFDCM_URL, options);
        const textResponse = await rawResponse.text();
        const parsedResponse: RetrieveResponse = PACSIntegration.parseResponse(textResponse);
        return parsedResponse.retrieve.status === 'success';
    }
}

export default PACSIntegration;