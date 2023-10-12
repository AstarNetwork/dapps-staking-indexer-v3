export function getDayIdentifier(timestamp: number): number {
    const dt = new Date(timestamp*1000)
    return 366*(dt.getUTCFullYear()-1970)+31*dt.getUTCMonth()+dt.getUTCDay()
}

export function getFirstTimestampOfTheNextDay(timestamp: number): number {
    const curDateTime = new Date(timestamp*1000)
    // need to apply different shifts before and after noon to make sure we are hitting just the next day
    // 30h shift before noon to account for the leap second
    // 24h shift after noon to not hit the day after tomorrow
    const nextDayTimeStamp = curDateTime.getUTCHours()<12 ? timestamp+30*60*60 : timestamp+24*60*60
    return getFirstTimestampOfTheDay(nextDayTimeStamp)
}

export function getFirstTimestampOfTheDay(timestamp: number): number {
    const curDateTime = new Date(timestamp*1000)
    curDateTime.setUTCSeconds(0)
    curDateTime.setUTCMinutes(0)
    curDateTime.setUTCHours(0)
    return Math.floor(curDateTime.valueOf() / 1000)
}
