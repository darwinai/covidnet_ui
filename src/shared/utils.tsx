import moment from "moment";
import { DateTime } from "luxon";

export const formatDate = (dateStr: string): string => {
  return moment(dateStr).format("YYYY MM DD");
}

export const formatGender = (gender: string): string => {
  return gender.includes("F") ? "Female" : "Male";
}

export const calculatePatientAge = (patientDOB: string): number => {
  return moment().diff(patientDOB, 'year');
}

export const formatTime = (oldDay: string): string => {
  return oldDay.split('.')[0];
}

export const modifyDatetime = (oldDay: string): string => {
  return DateTime.fromISO(oldDay).toRelativeCalendar() || ""; //capitalize first letter, test for days, weeks, months, years
}
