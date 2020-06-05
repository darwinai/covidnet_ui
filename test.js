const modifyDatetime = (oldDay) => {
  let today = new Date().setHours(0, 0, 0, 0)
  let diff = Math.abs(+today - +new Date(oldDay.split('T')[0]))
  diff = Math.floor(diff / (1000 * 60 * 60 * 24)) // diff is in days
  let description = "days ago"
  let rvtVal = `${diff} ${description}`
  console.log(diff)
  if (diff / 30 >= 1) {
    description = diff / 30 >= 2 ? "months ago": "month ago"
    diff = Math.floor((diff / 30))
    rvtVal = `${diff} ${description}`
  } else if (diff / 7 >= 1) {
    description = diff / 7 >= 2 ? "weeks ago": "week ago"
    diff = Math.floor(diff / 7)
    rvtVal = `${diff} ${description}`
  } else if (diff < 1) {
    rvtVal = oldDay.split('T')[1].split('.')[0]
  }
  return rvtVal
}


let oldDay = "2020-04-30T14:42:25.600774-04:00"
console.log(modifyDatetime(oldDay))