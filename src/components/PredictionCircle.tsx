import { ChartDonutUtilization } from '@patternfly/react-charts';
import React from "react";

interface circleProps {
  largeCircle: boolean;
  predictionNumber: number;
  isNormal: boolean;
}

const PredictionCircle: React.FC<circleProps> = ({largeCircle, predictionNumber, isNormal}) => {
  let divSize = '100px';

  let predictionCircleAttributes = {
    ariaDesc: "Prediction Result of Analysis",
    constrainToVisibleArea: true,
    data: { x: 'Prediction', y: predictionNumber },
    height: 120,
    width: 120,
    padding: 0,
    title: `${predictionNumber}%`,
    thresholds: [{value: 60}, {value: 90}]
  }

  if (!largeCircle) { // check boolean condition here
    predictionCircleAttributes.height = 150;
    predictionCircleAttributes.width = 150;
    divSize = "80px";
  }

  if (isNormal) {
    console.log("cheese");
    predictionCircleAttributes.thresholds = [];
  }

  return (
    <div style={{ height: divSize, width: divSize }}>
      <ChartDonutUtilization {...predictionCircleAttributes} />
    </div>
  )
}

export default PredictionCircle
