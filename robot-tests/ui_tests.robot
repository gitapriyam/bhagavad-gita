*** Settings ***
Documentation     This Robot Framework test suite uses the Browser library to perform end-to-end UI tests for the Bhagavad Gita Angular application. The suite verifies core functionalities such as loading the home page, displaying chapter lists, selecting slokas, setting and using cookies, and validating chapter resource links (Audio, PDF, Tamil PDF). It includes smoke tests for critical paths and ensures that UI elements and resources are present and functioning as expected. The suite is designed to run in headless mode and assumes the application is accessible at http://localhost:4280.
Library           Collections
Library           Browser

Suite Setup       Open Browser To App
Test Setup        Select Chapter By Index    1
Suite Teardown    Close Browser

*** Variables ***
${HEADLESS}       true
${APP_URL}        http://localhost:4280

*** Keywords ***
# Opens a web browser and navigates to the application under test.

Open Browser To App
    [Documentation]    Opens a new browser instance and navigates to the application URL.
    New Browser    headless=${HEADLESS}
    New Context    viewport={"width": 1280, "height": 800}
    # Opens a new browser page and navigates to the application URL specified by ${APP_URL}.
    New Page    ${APP_URL}

# Open the mobile chapter menu only when the desktop list is hidden.
Ensure Chapter Menu Is Open
    ${is_visible}=    Run Keyword And Return Status    Wait For Elements State    css=.chapters-list .chapter-list-item >> visible=true >> nth=0    visible    timeout=1s
    IF    not ${is_visible}
        Click    css=.chapter-menu-toggle
        Wait For Elements State    css=.chapters-overlay .chapter-list-item >> nth=0    visible
    END

Select Chapter By Index
    [Arguments]    ${index}    ${timeout}=15s
    [Documentation]    Selects a chapter by its 0-based index and waits for its verse list.
    Ensure Chapter Menu Is Open
    ${chapter}=    Set Variable    css=.chapters-list .chapter-list-item >> visible=true >> nth=${index}
    Wait For Elements State    ${chapter}    visible    timeout=${timeout}
    Click    ${chapter}
    Wait For Elements State    css=#sloka-list app-single-sloka >> nth=0    visible    timeout=${timeout}

Validate Chapter Resource Link
    [Arguments]    ${label}    ${expected_url_fragment}
    [Documentation]    Validates the chapter download link in the toolbar.
    ${resource}=    Set Variable    css=.title-bar a[aria-label="${label}"]
    Wait For Elements State    ${resource}    visible
    Wait For Condition    Attribute    ${resource}    href    contains    ${expected_url_fragment}    timeout=15s

Print Html content
    [Arguments]    ${css_selector}    ${content}
    [Documentation]    Prints the HTML content of the specified element to the console.
    ${html_content}=    Get Property    ${css_selector}    ${content}
    # Log To Console     HTML : ${html_content}

*** Test Cases ***
# Verifies that the Home Page loads successfully.
Home Page Loads
    [Tags]    smoke
    Go To    ${APP_URL}
    Get Title    ==    Bhagavad Gita

Chapter List Is Visible
    [Documentation]    Verifies that the chapter list is visible on the user interface.
    Ensure Chapter Menu Is Open
    ${first_chapter}=    Get Text    css=.chapters-list .chapter-list-item >> visible=true >> nth=0
    Should Be Equal    ${first_chapter}    Dhyanam

# This test case selects a chapter in the Bhagavad Gita application and verifies that the corresponding slokas (verses) are displayed to the user.
Select Chapter And See Slokas
    [Documentation]    This test case selects a chapter in the Bhagavad Gita application and verifies that the corresponding slokas (verses) are displayed to the user.
    ${css_selector}=    Set Variable    css=#sloka-list > div > ul > li:nth-child(1) > app-single-sloka > div > div.custom-pre.clickable > pre
    # Print Html content    ${css_selector}    innerHTML
    ${sloka_text}=    Get Text    ${css_selector}
    Should Not Be Empty    ${sloka_text}

Sloka Cookie Is Set On Selection
    [Documentation]    Validates that the Sloka cookie is properly set when a selection is made in the UI.
    ...                - `currentSloka`: Represents the currently selected sloka (verse) in the application. This cookie ensures that the user's selection is preserved across sessions or page reloads.
    ...                - `currentChapter`: Represents the chapter currently being viewed. This cookie helps maintain the user's context within the application.
    ...                - `showSanskrit`: Indicates whether the Sanskrit text display is enabled or disabled. This cookie reflects the user's preference for viewing the text in Sanskrit.
    Click   css=#sloka-list app-single-sloka >> nth=0 >> css=.sloka-single-container > div.custom-pre.clickable
    # Check that the cookie is set correctly
    ${currentSloka}=    Get Cookie    currentSloka
    Should Not Be Empty    ${currentSloka.value}

    ${currentChapter}=    Get Cookie    currentChapter
    Should Not Be Empty    ${currentChapter.value}

    ${showSanskrit}=    Get Cookie    showSanskrit
    Should Be Equal    ${showSanskrit.value}    false

Sloka Cookie Is Used On Reload
    [Documentation]    Validates that the Sloka cookie persists and is correctly used when the page is reloaded.
    ...                This test ensures that when a user selects a sloka (verse) in the Bhagavad Gita application, the selection is saved in a cookie named `currentSloka`.
    ...                The test verifies that the cookie value is retained after a page reload, ensuring a consistent user experience.
    ...                Steps:
    ...                1. Select the third sloka in the list.
    ...                2. Reload the page to simulate a user returning to the application.
    ...                3. Retrieve the `currentSloka` cookie and verify its value matches the selected sloka.
    # Clicks on the third sloka item in the list within the second div of the element with id 'sloka-list'.
    # This action targets the <div> inside the <app-single-sloka> component for the specified sloka.
    Click    css=#sloka-list app-single-sloka >> nth=2 >> css=.sloka-single-container > div.custom-pre.clickable
    Reload
    ${cookie}=    Get Cookie    currentSloka
    Should Be Equal    ${cookie.value}    2

Chapter URL Resources Are Valid
    [Tags]    smoke
    Validate Chapter Resource Link    Download audio        slokastorage
    Validate Chapter Resource Link    Download PDF          slokastorage
    Validate Chapter Resource Link    Download Tamil PDF    tamil.pdf
