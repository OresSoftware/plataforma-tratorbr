import React from "react";
import { getBuildHashLabel, getBuildTimeLabel, getEnvironmentLabel } from "../utils/buildInfo";
import "./style/BuildSignature.css";

const BuildSignature = ({ compact = false, inverted = false, className = "" }) => {
  const environment = getEnvironmentLabel();
  const buildHash = getBuildHashLabel();
  const buildTime = getBuildTimeLabel();
  const title = `${environment} • v${buildHash}${buildTime ? ` • build ${buildTime}` : ""}`;

  return (
    <div
      className={[
        "build-signature",
        compact ? "build-signature--compact" : "",
        inverted ? "build-signature--inverted" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={title}
      aria-label={title}
    >
      <span>{environment}</span>
      <span className="build-signature__dot">•</span>
      <strong>v{buildHash}</strong>
      {!compact && buildTime ? (
        <>
          <span className="build-signature__dot">•</span>
          <span>build {buildTime}</span>
        </>
      ) : null}
    </div>
  );
};

export default BuildSignature;
