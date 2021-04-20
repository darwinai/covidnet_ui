import React, { useContext, useState, useEffect } from "react";
import { Button, DatePicker, Split, SplitItem, isValidDate } from "@patternfly/react-core";
import { AppContext } from "../../context/context";
import { CreateAnalysisTypes, DicomImagesTypes } from "../../context/actions/types";
import CreateAnalysisService, { StudyInstance } from "../../services/CreateAnalysisService";
import { DcmImage } from "../../context/reducers/dicomImagesReducer";

const StudyFilters = () => {
    const { state: {dcmImages}, dispatch } = useContext(AppContext);

    const [minStudyDate, setMinStudyDate] = useState<string>("");
    const [maxStudyDate, setMaxStudyDate] = useState<string>("");

    useEffect(() => {
      const filteredDcmImages = dcmImages.allDcmImages.filter((image: DcmImage) => {
        const imageStudyDate = Date.parse(image.StudyDate);
        return (minStudyDate === "" || imageStudyDate >= Date.parse(minStudyDate)) &&
        (maxStudyDate === "" || imageStudyDate <= Date.parse(maxStudyDate))
      });

    dispatch({
      type: DicomImagesTypes.Update_filtered_images,
      payload: {
        images: filteredDcmImages
      }
    });
    const studyInstances: StudyInstance[] = CreateAnalysisService.extractStudyInstances(filteredDcmImages);
    if (studyInstances.length > 0) {
      dispatch({
        type: CreateAnalysisTypes.UpdateCurrSelectedStudyUID,
        payload: {
          studyUID: studyInstances[0].studyInstanceUID
        }
      });
    }
  }, [minStudyDate, maxStudyDate]);

  const clearFilters = async () => {
    setMinStudyDate("");
    setMaxStudyDate("");
  }

  const onMinDateChange = (_str: string, date?: Date) => {
    if (date && isValidDate(date)) {
      setMinStudyDate(date.toISOString().substring(0, 10));
      if (date >= new Date(maxStudyDate)) {
        setMaxStudyDate("");
      }
    }
  };

  const onMaxDateChange = (_str: string, date?: Date) => {
    if (date && isValidDate(date)) {
      setMaxStudyDate(date.toISOString().substring(0, 10));
      if (date <= new Date(minStudyDate)) {
        setMinStudyDate("");
      }
    }
  };

  return (
    <div className="InputRow">
      <div className="InputRowField">
        <label>Study Date</label>
        <Split hasGutter>
          <SplitItem>
            <DatePicker
              value={minStudyDate}
              onChange={onMinDateChange}
              aria-label="Minimum Study Date"
            />
          </SplitItem>
          <SplitItem>to</SplitItem>
          <SplitItem>
            <DatePicker
              value={maxStudyDate}
              onChange={onMaxDateChange}
              aria-label="Maximum Study Date"
            />
          </SplitItem>
        </Split>
      </div>
      <div className="InputRowField">
        <Button variant="secondary" onClick={clearFilters}>
          <b>Clear Filters</b>
        </Button>
      </div>
    </div>
  )
};

export default StudyFilters;
