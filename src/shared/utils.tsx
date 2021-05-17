import { DateTime, Duration } from "luxon";

export const formatDate = (dateStr: string): string => {
  return DateTime.fromISO(dateStr).toFormat("yyyy MM dd");
}

export const formatGender = (gender: string): string => {
  return gender.includes("F") ? "Female" : "Male";
}

export const calculatePatientAge = (patientDOB: string): number => {
  return Math.trunc(-DateTime.fromISO(patientDOB).diffNow("years").years);
}

export const formatTime = (oldDay: string): string => {
  return oldDay.split(".")[0];
}

export const modifyDatetime = (oldDay: number): string => {
  const inputDateTime: DateTime = DateTime.fromMillis(oldDay);
  const diff: Duration = inputDateTime.diffNow();
  return diff.days > 0 ? (inputDateTime.toRelativeCalendar() || "").split(" ").map(
    (date: string) => date.charAt(0).toUpperCase() + date.slice(1)).join(" ")
    : inputDateTime.toFormat('HH:mm:ss');
}
