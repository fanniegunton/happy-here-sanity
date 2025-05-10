// 1. Import the TimeInput react component
// import TimeInput from '../../components/'

// 2. List of days the editor may choose from
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// 3. Validate function which is invoked on user input
const verifyInput = dayAndTime => {
  const {day, opensAt, closesAt} = dayAndTime
  if (!day) {
    return 'Please select a day'
  }
  if (!opensAt) {
    return 'Choose when Happy Hour starts'
  }
  if (!closesAt) {
    return 'Choose when Happy Hour ends'
  }
  return opensAt < closesAt ? true : `Let's open the store before we close it on ${day}, shall we?`
}

export default {
  name: 'dayAndTime',
  title: 'Day and Time',
  type: 'object',

  fields: [
    {
      name: 'day',
      title: 'Day',
      type: 'string',
      description: 'Select day of week',
      options: {
        list: days,
        layout: 'radio'
      }
    },
    {
      name: 'startsAt',
      title: 'Starts at',
      description: 'Choose when Happy Hour starts',
      type: 'string',
    },
    {
      name: 'endsAt',
      title: 'Ends at',
      description: 'Choose when Happy Hour ends',
      type: 'string',
    }
  ],

  // 8. Define how the dayAndTime object will render in the Studio 
  preview: {
    select: {
      day: 'day',
      startsAt: 'startsAt',
      endsAt: 'endsAt'
    },
    prepare({day, startsAt, endsAt}) {
      return {
        title: day,
        subtitle: `${startsAt} - ${endsAt}`
      }
    }
  }
}
