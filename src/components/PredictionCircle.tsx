import { ChartDonutUtilization } from '@patternfly/react-charts';
import React from "react";

interface circleProps {
  largeCircle: boolean;
  predictionNumber: number;
  isNormal: boolean;
}

const PredictionCircle: React.FC<circleProps> = ({ largeCircle, predictionNumber, isNormal }) => {
  let divSize = (!largeCircle) ? "80px" : "100px";
  let size = (!largeCircle) ? 120 : 150;
  let thresholds = (isNormal) ? [] : [{ value: 0 }, { value: 90 }];

  return (
    <div style={{ height: divSize, width: divSize }}>
      <ChartDonutUtilization
        ariaDesc="Prediction Result of Analysis"
        constrainToVisibleArea={true}
        data={{ x: 'Prediction', y: predictionNumber }}
        height={size}
        width={size}
        padding={0}
        title={`${predictionNumber}%`}
        thresholds={thresholds}
      />
    </div>
  )
}

export default PredictionCircle
