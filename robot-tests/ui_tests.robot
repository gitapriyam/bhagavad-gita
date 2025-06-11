*** Settings ***
Library           Collections
Library           Browser    timeout=30s

Suite Setup       Open Browser To App
Suite Teardown    Close Browser

*** Variables ***
${HEADLESS}       true
${APP_URL}        http://localhost:4280

*** Keywords ***
Open Browser To App
    New Browser    headless=${HEADLESS}
    New Page    ${APP_URL}

*** Test Cases ***
Home Page Loads
    [Tags]    smoke
    Go To    ${APP_URL}
    Get Title    ==    Bhagavad Gita

Chapter List Is Visible
    ${first_chapter}=    Get Text    css=.chapters-list li:first-child h4
    Should Be Equal    ${first_chapter}    Dhyanam

Select Chapter And See Slokas
    ${sloka_text}=    Get Text    css=#sloka-list > div:nth-child(2) > ul > li:first-child > app-single-sloka > div > div > pre
    Should Not Be Empty    ${sloka_text}

Sloka Cookie Is Set On Selection
    Click   css=#sloka-list > div:nth-child(2) > ul > li:nth-child(2) > app-single-sloka > div
    # Check that the cookie is set correctly
    ${currentSloka}=    Get Cookie    currentSloka
    Should Not Be Empty    ${currentSloka.value}

    ${currentChapter}=    Get Cookie    currentChapter
    Should Not Be Empty    ${currentChapter.value}

    ${showSanskrit}=    Get Cookie    showSanskrit
    Should Be Equal    ${showSanskrit.value}    false

Sloka Cookie Is Used On Reload
    Click    css=#sloka-list > div:nth-child(2) > ul > li:nth-child(3) > app-single-sloka > div
    Reload
    ${cookie}=    Get Cookie    currentSloka
    Should Be Equal    ${cookie.value}    2

Chapter Resources are available
    Click    css=i.dropbtn
    ${resources}=    Get Elements    css=.dropdown-content a
    Should Not Be Empty    ${resources}
    Length Should Be    ${resources}    3

Chapter Audio Resource is valid
    [Tags]    smoke
    # Check if the first resource is Audio
    ${first_resource}=    Get Text    css=.dropdown-content a:first-child
    Should Be Equal    ${first_resource}    Audio
    # Check if the audio link is valid
    Click    selector=.dropdown-content a:first-child
    ${audio_url}=    Get Attribute    css=.dropdown-content a:first-child  href
    Should Contain    ${audio_url}    slokastorage
Chapter PDF Resource is valid
    [Tags]    smoke
    # Check if the pdf link name contains 'PDF'
    ${second_resource}=    Get Text    css=.dropdown-content a:nth-child(2)
    Should Be Equal    ${second_resource}    PDF
    # Check if the pdf link is valid
    Click    selector=.dropdown-content a:nth-child(2)
    ${pdf_url}=    Get Attribute    css=.dropdown-content a:nth-child(2)    href
    Should Contain    ${pdf_url}    slokastorage
Chapter Tamil PDF Resource is valid
    [Tags]    smoke
    # Check if the third resource name is Tamil PDF
    ${third_resource}=    Get Text    css=.dropdown-content a:nth-child(3)
    Should Be Equal    ${third_resource}    Tamil PDF
    # Check if the Tamil PDF link is valid
    Click    selector=.dropdown-content a:nth-child(3)
    ${pdf_url}=    Get Attribute    css=.dropdown-content a:nth-child(3)    href
    Should Contain    ${pdf_url}    tamil.pdf