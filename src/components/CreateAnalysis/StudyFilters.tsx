import React, { useContext, useState, useEffect } from "react";
import { Button, TextInput, DatePicker, Split, SplitItem, isValidDate } from '@patternfly/react-core';
import { AppContext } from "../../context/context";
import { CreateAnalysisTypes, DicomImagesTypes } from "../../context/actions/types";
import CreateAnalysisService, { StudyInstance } from "../../services/CreateAnalysisService";

const StudyFilters = () => {
    const { state: {dcmImages}, dispatch } = useContext(AppContext);

    const [seriesInstanceUID, setSeriesInstanceUID] = useState<string>("");
    const [minStudyDate, setMinStudyDate] = useState<string>('');
    const [maxStudyDate, setMaxStudyDate] = useState<string>('');

    useEffect(() => {
      const filteredDcmImages = dcmImages.allDcmImages.filter(image => {
        const imageStudyDate = Date.parse(image.StudyDate);
        return (seriesInstanceUID === '' || image.SeriesInstanceUID.includes(seriesInstanceUID)) &&
        (minStudyDate === '' || imageStudyDate >= Date.parse(minStudyDate)) &&
        (maxStudyDate === '' || imageStudyDate <= Date.parse(maxStudyDate))
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
    }, [seriesInstanceUID, minStudyDate, maxStudyDate]);

    const clearFilters = async () => {
      setSeriesInstanceUID('');
      setMinStudyDate('');
      setMaxStudyDate('');
    }

    const onMinDateChange = (_str: string, date?: Date) => {
      if (date && isValidDate(date)) {
        setMinStudyDate(date.toISOString().substring(0, 10));
        if (date >= new Date(maxStudyDate)) {
          setMaxStudyDate('');
        }
      }
    };

    const onMaxDateChange = (_str: string, date?: Date) => {
      if (date && isValidDate(date)) {
        setMaxStudyDate(date.toISOString().substring(0, 10));
        if (date <= new Date(minStudyDate)) {
          setMinStudyDate('');
        }
      }
    };

    return (
        <React.Fragment>
        <div className="InputRow">
          <div className="InputRowField">
            <label>Series UID</label>
            <TextInput value={seriesInstanceUID} type="text" onChange={setSeriesInstanceUID} aria-label="Series UID" />
          </div>
          <div className="InputRowField">
            <label>Study Date</label>
            <Split hasGutter>
              <SplitItem>
                <DatePicker
                  value={minStudyDate}
                  onChange={onMinDateChange}
                  aria-label="From date"
                />
              </SplitItem>
              <SplitItem>to</SplitItem>
              <SplitItem>
                <DatePicker
                  value={maxStudyDate}
                  onChange={onMaxDateChange}
                  aria-label="To date"
                />
              </SplitItem>
            </Split>
          </div>
        </div>
        <div className="InputRow">
          <div className="InputRowField">
            <Button variant="secondary" onClick={clearFilters}>
                <b>Clear Filters</b>
            </Button>
          </div>
        </div>
      </React.Fragment>
    )
}

export default StudyFilters;
