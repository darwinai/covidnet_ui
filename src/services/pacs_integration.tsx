import { DcmImage, PFDCMResponse, PACSMainResponse, PACSSeries} from "../context/reducers/dicomImagesReducer";
import { BASE_PACS_FILE_PATH } from '../app.config';
import axios from 'axios';

declare var process: {
    env: {
        REACT_APP_CHRIS_UI_PFDCM_URL: string,
    }
};

class PACSIntegration {

    static parseResponse(rawResponse: string): PFDCMResponse | undefined {
        try {
            let responseHeader = rawResponse.split('\r');
            // the 4th element of responseHeader contains the stringified JSON body return payload
            const responseBody = responseHeader?.[4];
            const responseJSON: PFDCMResponse = JSON.parse(responseBody);
            return responseJSON;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

    /**
     * Performs a PACS query on the given PatientID and returns an array of DcmImages containing metadata 
     * of the DICOM files associated with that patient
     * @param {string | undefined} patientID 
     */
    static async queryPatientFiles(patientID?: string): Promise<DcmImage[]> {
        if (!patientID) return [];
        
        try {
            const rawResponse = await axios.post(process.env.REACT_APP_CHRIS_UI_PFDCM_URL, JSON.stringify({
                action:"PACSinteract",
                meta:{
                    do:"query",
                    on:{PatientID: patientID},
                    PACS:"orthanc"
                }
            }), {headers: {'Content-Type': 'text/plain'}});
            const parsedResponse = this.parseResponse(rawResponse?.data);
            const data = parsedResponse?.query?.data;
            const patientData = data?.flatMap((study: PACSMainResponse): DcmImage[] => (
                study.series.map((series: PACSSeries): DcmImage => ({
                        id: series.uid.value,
                        creation_date: series.StudyDate.value,
                        fname: BASE_PACS_FILE_PATH + series.SeriesInstanceUID.value,
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
                }))
            ));
            
            return patientData ? patientData : [];
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Performs a PACS retrieve request for a DICOM file based on StudyInstanceUID and SeriesInstanceUID, 
     * returning true if request was successfully sent
     * @param {string | undefined} StudyInstanceUID 
     * @param {string | undefined} SeriesInstanceUID 
     */
    static async retrievePatientFiles(StudyInstanceUID?: string, SeriesInstanceUID?: string): Promise<boolean> {
        try {
            const rawResponse = await axios.post(process.env.REACT_APP_CHRIS_UI_PFDCM_URL, JSON.stringify({
                action:"PACSinteract",
                meta:{
                    do:"retrieve",
                    on:{
                        StudyInstanceUID, 
                        SeriesInstanceUID
                    },
                    PACS:"orthanc"
                }
            }), {headers: {'Content-Type': 'text/plain'}});
            const parsedResponse = this.parseResponse(rawResponse?.data);
            if (parsedResponse?.retrieve?.status === 'success') {
                return true;
            } else {
                return Promise.reject(new Error('Unable to fetch DICOM with StudyInstanceUID:' + StudyInstanceUID + ', SeriesInstanceUID: ' + SeriesInstanceUID));
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

export default PACSIntegration;
