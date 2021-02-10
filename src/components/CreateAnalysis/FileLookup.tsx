import React, { useContext, useState, useEffect } from "react";
import { Button, TextInput, DatePicker, Split, SplitItem, isValidDate } from '@patternfly/react-core';
import { AppContext } from "../../context/context";
import { CreateAnalysisTypes, DicomImagesTypes } from "../../context/actions/types";
import CreateAnalysisService, { StudyInstance } from "../../services/CreateAnalysisService";

const FileLookup = () => {
    const { state: {dcmImages}, dispatch } = useContext(AppContext);

    const [seriesInstanceUID, setSeriesInstanceUID] = useState<string>('');
    const [minCreationDate, setMinCreationDate] = useState<string>('');
    const [maxCreationDate, setMaxCreationDate] = useState<string>('');

    useEffect(() => {
      const filteredDcmImages = dcmImages.allDcmImages.filter(image => {
        const imageCreationDate = Date.parse(image.creation_date.substring(0, 10));
        return (seriesInstanceUID === '' || image.SeriesInstanceUID.includes(seriesInstanceUID)) &&
        (minCreationDate === '' || imageCreationDate >= Date.parse(minCreationDate)) &&
        (maxCreationDate === '' || imageCreationDate <= Date.parse(maxCreationDate))
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
    }, [seriesInstanceUID, minCreationDate, maxCreationDate]);

    const clearFilters = async () => {
      setSeriesInstanceUID('');
      setMinCreationDate('');
      setMaxCreationDate('');
    }

    const onMinDateChange = (_str: string, date: Date | undefined) => {
      if (date && isValidDate(date)) {
        setMinCreationDate(date.toISOString().substring(0, 10));
        if (date >= new Date(maxCreationDate)) {
          setMaxCreationDate('');
        }
      }
    };

    const onMaxDateChange = (_str: string, date: Date | undefined) => {
      if (date && isValidDate(date)) {
        setMaxCreationDate(date.toISOString().substring(0, 10));
        if (date <= new Date(minCreationDate)) {
          setMinCreationDate('');
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

export default FileLookup;
