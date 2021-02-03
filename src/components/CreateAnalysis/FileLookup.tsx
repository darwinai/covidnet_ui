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
        if (seriesInstanceUID !== '' && (!image.SeriesInstanceUID.includes(seriesInstanceUID))) return false
        if (minCreationDate !== '' && (Date.parse(image.creation_date) < Date.parse(minCreationDate))) return false
        if (maxCreationDate !== '' && (Date.parse(image.creation_date) > Date.parse(maxCreationDate))) return false
        return true
      })

      dispatch({
        type: DicomImagesTypes.Update_filtered_images,
        payload: {
          images: filteredDcmImages
        }
      })
      const studyInstances: StudyInstance[] = CreateAnalysisService.extractStudyInstances(filteredDcmImages);
      if (studyInstances.length > 0) {
        dispatch({
          type: CreateAnalysisTypes.UpdateCurrSelectedStudyUID,
          payload: {
            studyUID: studyInstances[0].studyInstanceUID
          }
        })
      }
    }, [seriesInstanceUID, minCreationDate, maxCreationDate]);

    const clearFilters = async () => {
      setSeriesInstanceUID('');
      setMinCreationDate('');
      setMaxCreationDate('');
    }

    const maxDateValidator = (date: Date) => isValidDate(new Date(minCreationDate)) && date >= new Date(minCreationDate) ? '' : 'Minimum date must be less than maximum date';

    const onMinDateChange = (_str: string, date: Date | undefined) => {
      if (date && isValidDate(date)) {
        setMinCreationDate(date.toISOString().substring(0, 10));
        date.setDate(date.getDate() + 1);
        setMaxCreationDate(date.toISOString().substring(0, 10));
      }
      else setMaxCreationDate('');
    };

    return (
        <React.Fragment>
        <div className="InputRow">
          <div className="InputRowField">
            <label>Series UID</label>
            <TextInput value={seriesInstanceUID} type="text" onChange={setSeriesInstanceUID} aria-label="text input example" />
          </div>
          <div className="InputRowField">
            <label>Creation Date</label>
            <Split hasGutter>
              <SplitItem>
                <DatePicker
                  value={minCreationDate}
                  onChange={onMinDateChange}
                  aria-label="Start date"
                />
              </SplitItem>
              <SplitItem style={{ padding: '6px 12px 0 12px' }}>to</SplitItem>
              <SplitItem>
                <DatePicker
                  value={maxCreationDate}
                  onChange={date => setMaxCreationDate(date.toString())}
                  isDisabled={!isValidDate(new Date(minCreationDate))}
                  rangeStart={new Date(minCreationDate)}
                  validators={[maxDateValidator]}
                  aria-label="End date"
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