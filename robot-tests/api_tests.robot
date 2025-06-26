*** Settings ***
Library           RequestsLibrary
Library           Collections
# Suite for API endpoint validation of the Bhagavad Gita Angular app.
#
# This suite verifies the REST API endpoints exposed by the backend, including:
#   - Chapter audio and resource endpoints
#   - Sloka groups and individual sloka endpoints
#   - Negative cases (invalid sloka, disallowed methods)
#
# Key Features:
#   - Uses RequestsLibrary for HTTP requests
#   - Session management for efficient connection reuse
#   - Custom keyword for DRY JSON key validation
#   - Smoke tags for core endpoint coverage
#   - Designed for CI/CD compatibility
#
# Usage:
#   - Run with: robot api_tests.robot
#   - Requires API server running at ${API_URL}
#   - Integrates with CI/CD for automated verification
#
# Maintenance:
#   - Add new endpoints as new test cases
#   - Use `Validate JSON Response Contains Key` for JSON key assertions
#   - Extend negative tests for new error scenarios

Suite Setup       Create Session To API
Suite Teardown    Delete All Sessions

*** Variables ***
${API_URL}        http://localhost:4280/api

*** Keywords ***
# Create a session to the API, disabling SSL warnings for local/dev environments.
Create Session To API
    Log To Console     Suite Setup: Creating API session
    Evaluate           __import__('urllib3').disable_warnings()
    Create Session     api    ${API_URL}    verify=False
    Log To Console     API session created: api

# Assert that a JSON response contains a specific key and has the correct content type.
Validate JSON Response Contains Key
    [Arguments]    ${response}    ${key}
    Should Contain    ${response.headers['Content-Type']}    application/json
    Should Contain    ${response.json()}    ${key}

*** Test Cases ***
# Verify chapter audio resource endpoint returns 200 and contains a 'url' in JSON.
Get Chapter Audio Resource Returns 200
    ${response}=    GET On Session    api    /chapterAudio/1
    Status Should Be    200    ${response}
    Validate JSON Response Contains Key    ${response}    url

# Verify chapter resource endpoint returns 200 and contains a 'url' in JSON.
Get Chapter Resource Returns 200
    ${response}=    GET On Session    api    /chapterResource/1
    Status Should Be    200    ${response}
    Validate JSON Response Contains Key    ${response}    url

# Verify slokaGroups endpoint returns 200 and contains 'groups' in JSON.
Get slokaGroups Returns 200
    [Tags]    smoke
    ${response}=      GET On Session  api  /slokaGroups/1
    Status Should Be  200  ${response}
    Validate JSON Response Contains Key    ${response}    groups

# Verify sloka endpoint returns 200 and contains 'content' in JSON.
Get Sloka Returns 200
    [Tags]    smoke
    ${response}=    GET On Session    api    /sloka/1/1
    Status Should Be    200    ${response}
    Validate JSON Response Contains Key    ${response}    content

# Verify sloka audio endpoint returns 200 and contains 'url' in JSON.
Get Sloka Audio Returns 200
    [Tags]    smoke
    ${response}=    GET On Session    api    /slokaAudio/1/1
    Status Should Be    200    ${response}
    Validate JSON Response Contains Key    ${response}    url

# Verify invalid sloka returns 400 error.
Invalid Sloka Returns 400
    ${response}=    GET On Session  api    /sloka/999/999    expected_status=any
    Status Should Be  400  ${response}

# Verify POST is not allowed on sloka endpoint (should return 404).
Post To API Not Allowed
    ${response}=    POST On Session    api     /sloka/1/1    expected_status=any
    Status Should Be    404   ${response}

# Verify slokaSearch endpoint returns 200 and contains 'results' in JSON.
Get Sloka Search English is Functional
    [Tags]    smoke
    ${response}=    GET On Session    api    url=/slokaSearch?searchText=karma&top=2
    Status Should Be    200    ${response}
    ${results}=    Set Variable    ${response.json()}
    Should Not Be Empty    ${results}
    Should Be True    len(${results}) > 0
    # Check that the first result has a 'chapter' key
    Dictionary Should Contain Key    ${results}[0]    chapter

Get Sloka Search Sanskrit is Functional
    [Tags]    smoke
    ${response}=    GET On Session    api    url=/slokaSearch?searchText=केशव&top=2&lang=sanskrit
    Status Should Be    200    ${response}
    ${results}=    Set Variable    ${response.json()}
    Should Not Be Empty    ${results}
    Should Be True    len(${results}) > 0
    # Check that the first result has a 'chapter' key
    Dictionary Should Contain Key    ${results}[0]    chapter