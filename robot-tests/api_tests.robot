*** Settings ***
Library           RequestsLibrary

Suite Setup       Create Session To API
Suite Teardown    Delete All Sessions

*** Variables ***
${API_URL}        http://localhost:4280/api

*** Keywords ***
*** Keywords ***
Create Session To API
    Log To Console     Suite Setup: Creating API session
    Evaluate           __import__('urllib3').disable_warnings()
    Create Session     api    ${API_URL}    verify=False
    Log To Console     API session created: api

*** Test Cases ***

Get Chapter Audio Resource Returns 200
    ${response}=    GET On Session    api    /chapterAudio/1
    Status Should Be    200    ${response}
    # 1. Check Content-Type header
    Should Contain    ${response.headers['Content-Type']}    application/json
    # 2. Try to parse the response as JSON
    Should Contain    ${response.json()}    url

Get Chapter Resource Returns 200
    ${response}=    GET On Session    api    /chapterResource/1
    Status Should Be    200    ${response}
    # 1. Check Content-Type header
    Should Contain    ${response.headers['Content-Type']}    application/json
    # 2. Try to parse the response as JSON
    Should Contain    ${response.json()}    url
Get slokaGroups Returns 200
    [Tags]    smoke
    ${response}=      GET On Session  api  /slokaGroups/1
    Status Should Be  200  ${response}
    Should Contain    ${response.text}  groups

Get Sloka Returns 200
    [Tags]    smoke
    ${response}=    GET On Session    api    /sloka/1/1
    Status Should Be    200    ${response}
    Should Contain    ${response.text}    Dhritaraashtra

Get Sloka Audio Returns 200
    [Tags]    smoke
    ${response}=    GET On Session    api    /slokaAudio/1/1
    Status Should Be    200    ${response}
    Should Contain    ${response.text}    url

Invalid Sloka Returns 400
    ${response}=    GET On Session  api    /sloka/999/999    expected_status=any
    Status Should Be  400  ${response}

Post To API Not Allowed
    ${response}=    POST On Session    api     /sloka/1/1    expected_status=any
    Status Should Be    404   ${response}