import React, { useContext, useState, useEffect } from "react";
import { Button, DatePicker, Split, SplitItem, isValidDate } from "@patternfly/react-core";
import { AppContext } from "../../context/context";
import { CreateAnalysisTypes, DicomImagesTypes } from "../../context/actions/types";
import CreateAnalysisService, { StudyInstance } from "../../services/CreateAnalysisService";

const FileLookup = () => {
  const { state: { dcmImages }, dispatch } = useContext(AppContext);

  const [minCreationDate, setMinCreationDate] = useState<string>("");
  const [maxCreationDate, setMaxCreationDate] = useState<string>("");

  useEffect(() => {
    const filteredDcmImages = dcmImages.allDcmImages.filter(image => {
      const imageCreationDate = Date.parse(image.creation_date.substring(0, 10));
      return (minCreationDate === "" || imageCreationDate >= Date.parse(minCreationDate)) &&
        (maxCreationDate === "" || imageCreationDate <= Date.parse(maxCreationDate))
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
  }, [minCreationDate, maxCreationDate]);

  const clearFilters = async () => {
    setMinCreationDate("");
    setMaxCreationDate("");
  }

  const onMinDateChange = (_str: string, date?: Date) => {
    if (date && isValidDate(date)) {
      setMinCreationDate(date.toISOString().substring(0, 10));
      if (date >= new Date(maxCreationDate)) {
        setMaxCreationDate("");
      }
    }
  };

  const onMaxDateChange = (_str: string, date?: Date) => {
    if (date && isValidDate(date)) {
      setMaxCreationDate(date.toISOString().substring(0, 10));
      if (date <= new Date(minCreationDate)) {
        setMinCreationDate("");
      }
    }
  };

  return (
    <>
      <div className="InputRow">
        <div className="InputRowField">
          <label>File Creation Date</label>
          <Split hasGutter>
            <SplitItem>
              <DatePicker
                value={minCreationDate}
                onChange={onMinDateChange}
                aria-label="From date"
              />
            </SplitItem>
            <SplitItem>to</SplitItem>
            <SplitItem>
              <DatePicker
                value={maxCreationDate}
                onChange={onMaxDateChange}
                aria-label="To date"
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
    </>
  )
}

export default FileLookup;
