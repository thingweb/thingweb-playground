/**
 * Generate the root level openAPI general information
 * @param {object} td The input TD
 */
function createInfo(td) {
    const cInfo = {}
    // add title
    /* is required for valid TDs but in order to avoid testing constraints,
       TDs are not necessarily validated before OpenAPI generation
       e.g. test upcoming TD spec features */
    if (td.title !== undefined) {
        cInfo.title = td.title
    }
    else {
        cInfo.title = "Thing Description Playground autogenerated OpenAPI object"
    }

    // add version
    if (td.version && td.version.instance) {
        cInfo.version = td.version.instance
    }
    else {
        cInfo.version = "unknown"
    }

    // add description
    if (td.description !== undefined) {
        cInfo.description = td.description
    }

    // add support contact
    if (td.support) {
        if (td.support.startsWith("mailto:")) {
            cInfo.contact = {email: td.support.slice(7)}
        }
        else if (td.support.startsWith("http://") || td.support.startsWith("https://")) {
            cInfo.contact = {url: td.support}
        }
        else {
            cInfo.contact = {"x-uri": td.support}
        }
    }

    // add optional custom fields
    const tdOpts = ["@context", "@type", "created", "descriptions", "id", "links", "modified", "name", "titles"]
    tdOpts.forEach( prop => {
        if (td[prop] !== undefined) {
            cInfo["x-" + prop] = td[prop]
        }
    })

    return cInfo
}

module.exports = createInfo
