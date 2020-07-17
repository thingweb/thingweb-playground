/* *******************************************************************************
 * Copyright (c) 2020 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 * Document License (2015-05-13) which is available at
 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document.
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/

 /**
  * This file contains functions, which are required by the core package as
  * well as by the playground-assertions package
  */

// A special JSON validator that is used only to check whether the given object has duplicate keys.
// The standard library doesn't detect duplicate keys and overwrites the first one with the second one.
// TODO: replace with jsonlint ??
const jsonValidator = require('json-dup-key-validator')

// This is used to validate if the multi language JSON keys are valid according to the BCP47 spec
const bcp47pattern = /^(?:(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))$|^((?:[a-z]{2,3}(?:(?:-[a-z]{3}){1,3})?)|[a-z]{4}|[a-z]{5,8})(?:-([a-z]{4}))?(?:-([a-z]{2}|\d{3}))?((?:-(?:[\da-z]{5,8}|\d[\da-z]{3}))*)?((?:-[\da-wy-z](?:-[\da-z]{2,8})+)*)?(-x(?:-[\da-z]{1,8})+)?$|^(x(?:-[\da-z]{1,8})+)$/i // eslint-disable-line max-len


module.exports =  {
    checkPropUniqueness,
    checkSecurity,
    checkMultiLangConsistency
}


// -------------------------------------------------- checkPropUniqueness

/**
 *  Checking whether in one interaction pattern there are duplicate names, e.g. two properties called temp
 *  However, if there are no properties then it is not-impl
 *
 * @param {string} tdString The Td under test as string
 */
function checkPropUniqueness(tdString) {

    const results = []

    // jsonvalidator throws an error if there are duplicate names in the interaction level
    try {
        jsonValidator.parse(tdString, false)

        if (noAssertions) {
            return true
        }

        const td = JSON.parse(tdString)

        // no problem in interaction level
        let tdInteractions = []

        // checking whether there are properties at all, if not uniqueness is not impl
        if (td.hasOwnProperty("properties")) {
            tdInteractions = tdInteractions.concat(Object.keys(td.properties))
            // then we can add unique properties pass
            results.push({
                "ID": "td-properties_uniqueness",
                "Status": "pass",
                "Comment": ""
            })
        } else {
            // then we add unique properties as not impl
            results.push({
                "ID": "td-properties_uniqueness",
                "Status": "not-impl",
                "Comment": "no properties"
            })
        }

        // similar to just before, checking whether there are actions at all, if not uniqueness is not impl
        if (td.hasOwnProperty("actions")) {
            tdInteractions = tdInteractions.concat(Object.keys(td.actions))
            results.push({
                "ID": "td-actions_uniqueness",
                "Status": "pass",
                "Comment": ""
            })
        } else {
            // then we add unique actions as not impl
            results.push({
                "ID": "td-actions_uniqueness",
                "Status": "not-impl",
                "Comment": "no actions"
            })
        }

        // similar to just before, checking whether there are events at all, if not uniqueness is not impl
        if (td.hasOwnProperty("events")) {
            tdInteractions = tdInteractions.concat(Object.keys(td.events))
            results.push({
                "ID": "td-events_uniqueness",
                "Status": "pass",
                "Comment": ""
            })
        } else {
            // then we add unique events as not impl
            results.push({
                "ID": "td-events_uniqueness",
                "Status": "not-impl",
                "Comment": "no events"
            })
        }

        return results

    } catch (error) {
        // there is a duplicate somewhere

        // convert it into string to be able to process it
        // error is of form = Error: Syntax error: duplicated keys "overheating" near ting": {
        const errorString = error.toString()
        // to get the name, we need to remove the quotes around it
        const startQuote = errorString.indexOf('"')
        // slice to remove the part before the quote
        const restString = errorString.slice(startQuote + 1)
        // find where the interaction name ends
        const endQuote = restString.indexOf('"')
        // finally get the interaction name
        const interactionName = restString.slice(0, endQuote)

        // trying to find where this interaction is and put results accordingly
        const td = JSON.parse(tdString)

        if (td.hasOwnProperty("properties")) {
            const tdProperties = td.properties
            if (tdProperties.hasOwnProperty(interactionName)) {
                // duplicate was at properties but that fails the td-unique identifiers as well
                // console.log("at property");
                results.push({
                    "ID": "td-properties_uniqueness",
                    "Status": "fail",
                    "Comment": "duplicate property names"
                })
                // since JSON.parse removes duplicates, we replace the duplicate name with duplicateName
                tdString = tdString.replace(interactionName, "duplicateName")

            } else {
                // there is duplicate but not here, so pass
                results.push({
                    "ID": "td-properties_uniqueness",
                    "Status": "pass",
                    "Comment": ""
                })
            }
        } else {
            results.push({
                "ID": "td-properties_uniqueness",
                "Status": "not-impl",
                "Comment": "no properties"
            })
        }

        if (td.hasOwnProperty("actions")) {
            const tdActions = td.actions
            if (tdActions.hasOwnProperty(interactionName)) {
                // duplicate was at actions but that fails the td-unique identifiers as well
                // console.log("at action");
                results.push({
                    "ID": "td-actions_uniqueness",
                    "Status": "fail",
                    "Comment": "duplicate action names"
                })
                // since JSON.parse removes duplicates, we replace the duplicate name with duplicateName
                tdString = tdString.replace(interactionName, "duplicateName")
            } else {
                results.push({
                    "ID": "td-actions_uniqueness",
                    "Status": "pass",
                    "Comment": ""
                })
            }
        } else {
            results.push({
                "ID": "td-actions_uniqueness",
                "Status": "not-impl",
                "Comment": "no actions"
            })
        }

        if (td.hasOwnProperty("events")) {
            const tdEvents = td.events
            if (tdEvents.hasOwnProperty(interactionName)) {
                // duplicate was at events but that fails the td-unique identifiers as well
                // console.log("at event");
                results.push({
                    "ID": "td-events_uniqueness",
                    "Status": "fail",
                    "Comment": "duplicate event names"
                })
                // since JSON.parse removes duplicates, we replace the duplicate name with duplicateName
                tdString = tdString.replace(interactionName, "duplicateName")
            } else {
                results.push({
                    "ID": "td-events_uniqueness",
                    "Status": "pass",
                    "Comment": ""
                })
            }
        } else {
            results.push({
                "ID": "td-events_uniqueness",
                "Status": "not-impl",
                "Comment": "no events"
            })
        }

        return results
    }
}


// -------------------------------------------------- checkSecurity

/**
 * check if used Security definitions are properly defined previously
 * @param {object} td The Td to do assertion tests
 */
function checkSecurity(td) {

    const results = []
    if (td.hasOwnProperty("securityDefinitions")) {
        const securityDefinitionsObject = td.securityDefinitions
        const securityDefinitions = Object.keys(securityDefinitionsObject)


        const rootSecurity = td.security

        if (securityContains(securityDefinitions, rootSecurity)) {
            // all good
        } else {
            results.push({
                "ID": "td-security-scheme-name",
                "Status": "fail",
                "Comment": "used a non defined security scheme in root level"
            })
            return results
        }

        if (td.hasOwnProperty("properties")) {
            // checking security in property level
            tdProperties = Object.keys(td.properties)
            for (let i = 0; i < tdProperties.length; i++) {
                const curPropertyName = tdProperties[i]
                const curProperty = td.properties[curPropertyName]

                // checking security in forms level
                const curForms = curProperty.forms
                for (let j = 0; j < curForms.length; j++) {
                    const curForm = curForms[j]
                    if (curForm.hasOwnProperty("security")) {
                        const curSecurity = curForm.security
                        if (securityContains(securityDefinitions, curSecurity)) {
                            // all good
                        } else {
                            results.push({
                                "ID": "td-security-scheme-name",
                                "Status": "fail",
                                "Comment": "used a non defined security scheme in a property form"
                            })
                            return results
                        }
                    }
                }
            }
        }

        if (td.hasOwnProperty("actions")) {
            // checking security in action level
            tdActions = Object.keys(td.actions)
            for (let i = 0; i < tdActions.length; i++) {
                const curActionName = tdActions[i]
                const curAction = td.actions[curActionName]

                // checking security in forms level
                const curForms = curAction.forms
                for (let j = 0; j < curForms.length; j++) {
                    const curForm = curForms[j]
                    if (curForm.hasOwnProperty("security")) {
                        const curSecurity = curForm.security
                        if (securityContains(securityDefinitions, curSecurity)) {
                            // all good
                        } else {
                            results.push({
                                "ID": "td-security-scheme-name",
                                "Status": "fail",
                                "Comment": "used a non defined security scheme in an action form"
                            })
                            return results
                        }
                    }
                }

            }
        }

        if (td.hasOwnProperty("events")) {
            // checking security in event level
            tdEvents = Object.keys(td.events)
            for (let i = 0; i < tdEvents.length; i++) {
                const curEventName = tdEvents[i]
                const curEvent = td.events[curEventName]

                // checking security in forms level
                const curForms = curEvent.forms
                for (let j = 0; j < curForms.length; j++) {
                    const curForm = curForms[j]
                    if (curForm.hasOwnProperty("security")) {
                        const curSecurity = curForm.security
                        if (securityContains(securityDefinitions, curSecurity)) {
                            // all good
                        } else {
                            results.push({
                                "ID": "td-security-scheme-name",
                                "Status": "fail",
                                "Comment": "used a non defined security scheme in an event form"
                            })
                            return results
                        }
                    }
                }

            }
        }

        // no security used non defined scheme, passed test
        results.push({
            "ID": "td-security-scheme-name",
            "Status": "pass"
        })
        return results

    }
    return results
}

/**
 * subfunction of checkSecurity
 * security anywhere could be a string or array. Convert string to array
 *
 * @param {*} parent
 * @param {string|Array<string>} child
 */
function securityContains(parent, child) {

    if (typeof child === "string") {
        child = [child]
    }
    return child.every(elem => parent.indexOf(elem) > -1)
}


// -------------------------------------------------- checkMultiLangConsistency

/**
 *  this checks whether all titles and descriptions have the same language fields
 *  so the object keys of a titles and of a descriptions should be the same already,
 *  then everywhere else they should also be the same
 *
 *  first collect them all, and then compare them
 *
 * @param {object} td The Td to do assertion tests
 */
function checkMultiLangConsistency(td) {

    const results = []
    const multiLang = [] // an array of arrays where each small array has the multilang keys
    const isTdTitlesDescriptions = [] // an array of boolean values to check td-titles-descriptions assertion

    // checking root
    if (td.hasOwnProperty("titles")) {
        const rootTitlesObject = td.titles
        const rootTitles = Object.keys(rootTitlesObject)
        multiLang.push(rootTitles)
        // checking for td-titles-descriptions
        isTdTitlesDescriptions.push({["root_title"]: isStringObjectKeyValue(td.title, rootTitlesObject)})
    }

    if (td.hasOwnProperty("descriptions")) {
        const rootDescriptionsObject = td.descriptions
        const rootDescriptions = Object.keys(rootDescriptionsObject)
        multiLang.push(rootDescriptions)
        // check whether description exists in descriptions
        if (td.hasOwnProperty("description")) {
            isTdTitlesDescriptions.push({["root_description"]: isStringObjectKeyValue(td.description, rootDescriptionsObject)})
        }
    }

    // checking inside each interaction
    if (td.hasOwnProperty("properties")) {
        // checking security in property level
        tdProperties = Object.keys(td.properties)
        for (let i = 0; i < tdProperties.length; i++) {
            const curPropertyName = tdProperties[i]
            const curProperty = td.properties[curPropertyName]

            if (curProperty.hasOwnProperty("titles")) {
                const titlesKeys = Object.keys(curProperty.titles)
                multiLang.push(titlesKeys)
                // checking if title exists in titles
                if (curProperty.hasOwnProperty("title")) {
                    isTdTitlesDescriptions.push({
                        ["property_"+curPropertyName + "_title"]: isStringObjectKeyValue(curProperty.title, curProperty.titles)
                    })
                }
            }

            if (curProperty.hasOwnProperty("descriptions")) {
                const descriptionsKeys = Object.keys(curProperty.descriptions)
                multiLang.push(descriptionsKeys)
                // checking if description exists in descriptions
                if (curProperty.hasOwnProperty("description")) {
                    isTdTitlesDescriptions.push({
                    ["property_" + curPropertyName + "_desc"]: isStringObjectKeyValue(curProperty.description,curProperty.descriptions)
                    })
                }
            }
        }
    }

    if (td.hasOwnProperty("actions")) {
        // checking security in action level
        tdActions = Object.keys(td.actions)
        for (let i = 0; i < tdActions.length; i++) {
            const curActionName = tdActions[i]
            const curAction = td.actions[curActionName]

            if (curAction.hasOwnProperty("titles")) {
                const titlesKeys = Object.keys(curAction.titles)
                multiLang.push(titlesKeys)
                // checking if title exists in titles
                if (curAction.hasOwnProperty("title")) {
                    isTdTitlesDescriptions.push({
                        ["action_" + curActionName + "_title"]: isStringObjectKeyValue(curAction.title, curAction.titles)
                    })
                }
            }

            if (curAction.hasOwnProperty("descriptions")) {
                const descriptionsKeys = Object.keys(curAction.descriptions)
                multiLang.push(descriptionsKeys)
                // checking if description exists in descriptions
                if (curAction.hasOwnProperty("description")) {
                    isTdTitlesDescriptions.push({
                         ["action_" + curActionName + "_desc"]: isStringObjectKeyValue(curAction.description, curAction.descriptions)
                    })
                }
            }

        }
    }

    if (td.hasOwnProperty("events")) {
        // checking security in event level
        tdEvents = Object.keys(td.events)
        for (let i = 0; i < tdEvents.length; i++) {
            const curEventName = tdEvents[i]
            const curEvent = td.events[curEventName]

            if (curEvent.hasOwnProperty("titles")) {
                const titlesKeys = Object.keys(curEvent.titles)
                multiLang.push(titlesKeys)
                // checking if title exists in titles
                if (curEvent.hasOwnProperty("title")) {
                    isTdTitlesDescriptions.push({
                        ["event_" + curEventName + "_title"]: isStringObjectKeyValue(curEvent.title, curEvent.titles)
                    })
                }
            }

            if (curEvent.hasOwnProperty("descriptions")) {
                const descriptionsKeys = Object.keys(curEvent.descriptions)
                multiLang.push(descriptionsKeys)
                // checking if description exists in descriptions
                if (curEvent.hasOwnProperty("description")) {
                    isTdTitlesDescriptions.push({
                        ["event_" + curEventName + "_desc"]: isStringObjectKeyValue(curEvent.description, curEvent.descriptions)
                    })
                }
            }

        }
    }
    if(arrayArraysItemsEqual(multiLang)){
        results.push({
            "ID": "td-multi-languages-consistent",
            "Status": "pass"
        })
    } else {
        results.push({
            "ID": "td-multi-languages-consistent",
            "Status": "fail",
            "Comment": "not all multilang objects have same language tags"
        })
    }

    const flatArray = [] // this is multiLang but flat, so just a single array.
    // This way we can have scan the whole thing at once and then find the element that is not bcp47

    for (let index = 0; index < multiLang.length; index++) {
        let arrayElement = multiLang[index]
        arrayElement=JSON.parse(arrayElement)
        for (let e = 0; e < arrayElement.length; e++) {
            const stringElement = arrayElement[e]
            flatArray.push(stringElement)
        }
    }
    const isBCP47 = checkBCP47array(flatArray)
    if(isBCP47 === "ok"){
        results.push({
            "ID": "td-multilanguage-language-tag",
            "Status": "pass"
        })
    } else {
        results.push({
            "ID": "td-multilanguage-language-tag",
            "Status": "fail",
            "Comment":isBCP47+" is not a BCP47 tag"
        })
    }

    // checking td-context-default-language-direction-script assertion
    results.push({
        "ID": "td-context-default-language-direction-script",
        "Status": checkAzeri(flatArray)
    })

    // checking td-titles-descriptions assertion
    // if there are no multilang, then it is not impl
    if(isTdTitlesDescriptions.length === 0){
        results.push({
            "ID": "td-titles-descriptions",
            "Status": "not-impl",
            "Comment": "no multilang objects in the td"
        })
        return results
    }

    // if at some point there was a false result, it is a fail
    for (let index = 0; index < isTdTitlesDescriptions.length; index++) {
        const element = isTdTitlesDescriptions[index]
        const elementName = Object.keys(element)

        if(element[elementName]){
            // do nothing it is correct
        } else {
            results.push({
                "ID": "td-titles-descriptions",
                "Status": "fail",
                "Comment": elementName+" is not on the multilang object at the same level"
            })
            return results
        }
    }
    // there was no problem, so just put pass
    results.push({
        "ID": "td-titles-descriptions",
        "Status": "pass"
    })

    // ? nothing after this, there is return above
    return results
}

/**
 * subfunction of checkMultiLangConsistency
 * checks if an array that contains only arrays as items is composed of same items
 *
 * @param {Array<object>} myArray The array to check
 */
function arrayArraysItemsEqual(myArray) {
    if(myArray.length === 0) return true
    // first stringify each array item
    for (let i = myArray.length; i--;) {
        myArray[i] = JSON.stringify(myArray[i])
    }

    for (let i = myArray.length; i--;) {
        if (i === 0) {
            return true
        }
        if (myArray[i] !== myArray[i - 1]){
            return false
        }
    }
}

/**
 * subfunction of checkMultiLangConsistency
 * checks whether the items of an array, which must be strings, are valid language tags
 *
 * @param {Array<string>} myArray The array, which items are to be checked
 */
function checkBCP47array(myArray){
    // return tag name if one is not valid during the check

    for (let index = 0; index < myArray.length; index++) {
        const element = myArray[index]
        if (bcp47pattern.test(element)) {
            // keep going
        } else {
            return element
        }
    }

    // return true if reached the end
    return "ok"
}

/**
 * subfunction of checkMultiLangConsistency
 * checks whether a given string exist as the value of key in an object
 *
 * @param {string} searchedString
 * @param {object} searchedObject
 */
function isStringObjectKeyValue(searchedString, searchedObject){
    const objKeys = Object.keys(searchedObject)
    if(objKeys.length === 0) return false // if the object is empty, then the string cannot exist here
    for (let index = 0; index < objKeys.length; index++) {
        const element = objKeys[index]
        if (searchedObject[element] === searchedString) {
            return true // found where the string is in the object
        } else {
            // nothing keep going, maybe in another key
        }
    }
    return false
}


/**
 * subfunction of checkMultiLangConsistency
 * checks whether an azeri language tag also specifies the version (Latn or Arab).
 * basically if the language is called "az", it is invalid, if it is az-Latn or az-Arab it is valid.
 *
 * @param {Array<string>} myMultiLangArray The language array to check
 */
function checkAzeri(myMultiLangArray){
    for (let index = 0; index < myMultiLangArray.length; index++) {
        const element = myMultiLangArray[index]
        if (element ==="az"){
            return "fail"
        } else if ((element === "az-Latn") || (element === "az-Arab")){
            return "pass"
        }
    }
    // no azeri, so it is not implemented
    return "not-impl"
}

// --------------------------------------------------