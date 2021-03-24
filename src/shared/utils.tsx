import moment from "moment";

export const formatDate = (dateStr: string): string => {
  return moment(dateStr).format("YYYY MM DD");
}

export const formatGender = (gender: string): string => {
  return gender.includes("F") ? "Female" : "Male";
}

export const calculatePatientAge = (patientDOB: string): number => {
  return moment().diff(patientDOB, "year");
}

export const formatTime = (oldDay: string): string => {
  return oldDay.split(".")[0]
}

export const modifyDatetime = (oldDay: string): string => {
  let today = new Date().setHours(0, 0, 0, 0)
  let diff = Math.abs(+today - +new Date(oldDay.split("T")[0]))
  diff = Math.floor(diff / (1000 * 60 * 60 * 24)) // diff is in days, 1ms * 1000 * 60 * 60 * 24
  let description = "days ago"
  let rvtVal = `${diff} ${description}`
  if (diff / 30 >= 1) {
    description = diff / 30 >= 2 ? "months ago" : "month ago"
    diff = Math.floor((diff / 30))
    rvtVal = `${diff} ${description}`
  } else if (diff / 7 >= 1) {
    description = diff / 7 >= 2 ? "weeks ago" : "week ago"
    diff = Math.floor(diff / 7)
    rvtVal = `${diff} ${description}`
  } else if (diff < 1) {
    rvtVal = oldDay.split("T")[1].split(".")[0]
  }
  return rvtVal
}
