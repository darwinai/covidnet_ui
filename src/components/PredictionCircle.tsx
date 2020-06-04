import React from "react";
import { ChartDonutUtilization } from '@patternfly/react-charts';


interface circleProps {
  covidCircle: boolean;
  predictionNumber: number;
}

const PredictionCircle = (props: circleProps) => {
  const {covidCircle, predictionNumber} = props
  return (
    // <div style={{ height: '80px', width: '80px' }}>
    //   <ChartDonutUtilization
    //     ariaDesc="Storage capacity"
    //     constrainToVisibleArea={true}
    //     data={{ x: 'Prediction', y: predictionNumber }}
    //     height={400}
    //     innerRadius={0}
    //     padding={0}
    //     title={`${predictionNumber}%`}
    //     thresholds={[{ value: 60 }, { value: 90 }]}
    //     width={435}
    //   />
    // </div>
    <span>{predictionNumber}%</span>
  )
}

export default PredictionCircle