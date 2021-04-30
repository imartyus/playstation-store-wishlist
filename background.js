import { refreshPriceData } from './helpers/pageScraping'

chrome.runtime.onInstalled.addListener(function () {
  chrome.alarms.create('wishlistPoll', { periodInMinutes: 60 })
})

// Refresh price data periodically
chrome.alarms.onAlarm.addListener(refreshPriceData)
