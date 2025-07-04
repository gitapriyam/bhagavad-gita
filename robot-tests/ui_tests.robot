*** Settings ***
Documentation     This Robot Framework test suite uses the Browser library to perform end-to-end UI tests for the Bhagavad Gita Angular application. The suite verifies core functionalities such as loading the home page, displaying chapter lists, selecting slokas, setting and using cookies, and validating chapter resource links (Audio, PDF, Tamil PDF). It includes smoke tests for critical paths and ensures that UI elements and resources are present and functioning as expected. The suite is designed to run in headless mode and assumes the application is accessible at http://localhost:4280.
Library           Collections
Library           Browser    timeout=30s

Suite Setup       Open Browser To App
Suite Teardown    Close Browser

*** Variables ***
${HEADLESS}       true
${APP_URL}        http://localhost:4280

*** Keywords ***
# Opens a web browser and navigates to the application under test.
Open Browser To App
    [Documentation]    Opens a new browser instance and navigates to the application URL.
    New Browser    headless=${HEADLESS}
    # Opens a new browser page and navigates to the application URL specified by ${APP_URL}.
    New Page    ${APP_URL}

# Ensures that the dropdown element is currently open and visible to the user. This keyword can be used to verify the state of dropdown menus before performing further actions or assertions.
Ensure Dropdown Is Open
    [Documentation]    Ensures that the dropdown is open by checking its visibility and clicking the drop button if it is not visible.
    ${is_visible}=    Run Keyword And Return Status    Get Element    css=.dropdown-content
    IF    not ${is_visible}
        Click    css=i.dropbtn
    END

Validate Chapter Resource Link
    [Arguments]    ${index}    ${expected_text}    ${expected_url_fragment}
    Ensure Dropdown Is Open
    ${resource}=    Get Text    css=.dropdown-content a:nth-child(${index})
    Should Be Equal    ${resource}    ${expected_text}
    ${url}=    Get Attribute    css=.dropdown-content a:nth-child(${index})    href
    Should Contain    ${url}    ${expected_url_fragment}

*** Test Cases ***
# Verifies that the Home Page loads successfully.
Home Page Loads
    [Tags]    smoke
    Go To    ${APP_URL}
    Get Title    ==    Bhagavad Gita

Chapter List Is Visible
    [Documentation]    Verifies that the chapter list is visible on the user interface.
    ${first_chapter}=    Get Text    css=.chapters-list li:first-child h4
    Should Be Equal    ${first_chapter}    Dhyanam

# This test case selects a chapter in the Bhagavad Gita application and verifies that the corresponding slokas (verses) are displayed to the user.
Select Chapter And See Slokas
    [Documentation]    This test case selects a chapter in the Bhagavad Gita application and verifies that the corresponding slokas (verses) are displayed to the user.
    ${sloka_text}=    Get Text    css=#sloka-list > div:nth-child(2) > ul > li:first-child > app-single-sloka > div > div > pre
    Should Not Be Empty    ${sloka_text}

Sloka Cookie Is Set On Selection
    [Documentation]    Validates that the Sloka cookie is properly set when a selection is made in the UI.
    ...                - `currentSloka`: Represents the currently selected sloka (verse) in the application. This cookie ensures that the user's selection is preserved across sessions or page reloads.
    ...                - `currentChapter`: Represents the chapter currently being viewed. This cookie helps maintain the user's context within the application.
    ...                - `showSanskrit`: Indicates whether the Sanskrit text display is enabled or disabled. This cookie reflects the user's preference for viewing the text in Sanskrit.
    Click   css=#sloka-list > div:nth-child(2) > ul > li:nth-child(2) > app-single-sloka > div
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
    Click    css=#sloka-list > div:nth-child(2) > ul > li:nth-child(3) > app-single-sloka > div
    Reload
    ${cookie}=    Get Cookie    currentSloka
    Should Be Equal    ${cookie.value}    2

# Verifies that the resources for a chapter are available and accessible in the application.
Chapter Resources Are Available
    [Documentation]    Verifies that the resources for a chapter are available and accessible in the application.
    [Tags]    smoke
    # Ensure the dropdown is open to check resources
    Ensure Dropdown Is Open
    ${resources}=    Get Elements    css=.dropdown-content a
    Should Not Be Empty    ${resources}
    Length Should Be    ${resources}    3

Chapter Audio Resource Is Valid
    [Tags]    smoke
    Validate Chapter Resource Link    1    Audio    slokastorage

Chapter PDF Resource Is Valid
    [Tags]    smoke
    Validate Chapter Resource Link    2    PDF    slokastorage

Chapter Tamil PDF Resource Is Valid
    [Tags]    smoke
    Validate Chapter Resource Link    3    Tamil PDF    tamil.pdf