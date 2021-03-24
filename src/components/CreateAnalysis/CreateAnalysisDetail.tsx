import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import avator from "../../assets/images/avator.png";
import { AppContext } from "../../context/context";
import RightArrowButton from "../../pages/CreateAnalysisPage/RightArrowButton";
import CreateAnalysisService, { StudyInstance } from "../../services/CreateAnalysisService";
import ModelSelection from "./ModelSelection";
import SelectedStudyDetail from "./SelectedStudyDetail";
import SelectionStudy from "./SelectionStudy";
import FileLookup from "./FileLookup";
import Error from "../../shared/error";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";
import { calculatePatientAge, formatDate } from "../../shared/utils";

interface CreateAnalysisDetailProps {
  setIsExpanded: Dispatch<SetStateAction<boolean>>,
  submitAnalysis: () => void
}

const CreateAnalysisDetail: React.FC<CreateAnalysisDetailProps> = ({ setIsExpanded, submitAnalysis }) => {
  const { state: { createAnalysis, dcmImages } } = useContext(AppContext);
  const [isXray, setIsXray] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientBirthdate, setPatientBirthdate] = useState("");
  const [patientSex, setPatientSex] = useState("");

  useEffect(() => {
    const image: DcmImage = dcmImages?.allDcmImages[0];
    if (image) {
      setPatientName(image.PatientName);
      setPatientBirthdate(image.PatientBirthDate);
      setPatientSex(image.PatientSex);
    }
  }, [dcmImages]);

  const studyInstances: StudyInstance[] = CreateAnalysisService.extractStudyInstances(dcmImages?.filteredDcmImages);
  const numOfSelectedImages: number = CreateAnalysisService.findTotalImages(createAnalysis.selectedStudyUIDs);

  const setModelType = (modality: string) => {
    setIsXray(modality === "CR"); // Determining which drop-down models (Xray/CT) should be displayed, based on modality of current study
  }

  return (
    <React.Fragment>
      <div className="detail-wrapper">
        <div className="detail-top-wrapper">
          <div className="detail-top-left">
            <h1>Create a new predictive analysis</h1>
            <p>Select at least one image series below and select the "Analyze" button to receive predictions per image.</p>
            <div className="detail-patient">
              <div>
                <img src={avator} alt="avator" width="100px" height="100px"></img>
              </div>
              <div className="detail-patient-title">
                <h2>{patientName}</h2>
                <p>MRN#{createAnalysis.patientID}</p>
              </div>
              <div className="detail-patient-name-age">
                <div className="detail-patient-name-age-title">
                  <h3>Patient Age</h3>
                  <h3>Patient Birthdate</h3>
                  <h3>Patient Gender</h3>
                </div>
                <div className="detail-patient-name-age-info">
                  <p> {calculatePatientAge(patientBirthdate)}y </p>
                  <p> {formatDate(patientBirthdate)} </p>
                  <p> {patientSex} </p>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-top-right">
            <div className="detail-top-right-box">
              <div className="numberCircle">{numOfSelectedImages}</div>
              <h3>Series selected</h3>
              <a onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {setIsExpanded(true); e.preventDefault();}} href="/#">(More details)</a>
              <ModelSelection isXray={isXray}></ModelSelection>
              <RightArrowButton click={submitAnalysis}>Analyze</RightArrowButton>
            </div>
          </div>
        </div>
        <PageSection className="PatientLookupWrapper" variant={PageSectionVariants.light}>
          <FileLookup />
        </PageSection>
        {
          studyInstances.length > 0 ?
            <div className="detail-bottom-wrapper">
              <div className="detail-select-studies">
                {studyInstances.map((study: StudyInstance) => {
                  study.setModelType = setModelType; // Passing function to change parent's state (Xray/CT)
                  return <SelectionStudy key={study.studyInstanceUID} {...study}></SelectionStudy>;
                })}
              </div>
              <SelectedStudyDetail></SelectedStudyDetail>
            </div>
            :
            <div className="detail-bottom-wrapper">
              <PageSection variant={PageSectionVariants.light}>
                <Error>No series found</Error>
              </PageSection>
            </div>
        }
      </div>
    </React.Fragment>
  )
}

export default CreateAnalysisDetail;


/*
swift -A http://127.0.0.1:8080/auth/v1.0 -U chris:chris1234 -K testing upload users
/Users/jbernal/PACS/BCH/5296709-VITO.DANIEL/CT.Abdomen.thru.Symphysis.w..Contrast-20120602-1.2.840.113619.2.55.3.51037702.990.1338550396.599/COR.STD-20120602-1.2.840.113619.2.80.45556984.23031.1338680717.1.4.1/00020-1.2.840.113619.2.80.45556984.23031.1338680724.22.dcm --object-name "SERVICES/PACS/BCH/5296709-VITO.DANIEL/CT.Abdomen.thru.Symphysis.w..Contrast-20120602-1.2.840.113619.2.55.3.51037702.990.1338550396.599/COR.STD-20120602-1.2.840.113619.2.80.45556984.23031.1338680717.1.4.1/00020-1.2.840.113619.2.80.45556984.23031.1338680724.22.dcm"
*/
