*** Settings ***
Documentation     This Robot Framework test suite uses the Browser library to perform end-to-end UI tests for the Bhagavad Gita Angular application. The suite verifies core functionalities such as loading the home page, displaying chapter lists, selecting slokas, setting and using cookies, and validating chapter resource links (Audio, PDF, Tamil PDF). It includes smoke tests for critical paths and ensures that UI elements and resources are present and functioning as expected. The suite is designed to run in headless mode and assumes the application is accessible at http://localhost:4280.
Library           Collections
Library           Browser

Suite Setup       Open Browser App and Select Chapter
Suite Teardown    Close Browser

*** Variables ***
${HEADLESS}       true
${APP_URL}        http://localhost:4280

*** Keywords ***
# Opens a web browser and navigates to the application under test.

Open Browser App and Select Chapter
    [Arguments]    ${chapter_index}=1
    [Documentation]    Opens the application in a new browser instance and selects a chapter by its index.
    Open Browser To App
    Select Chapter By Index    ${chapter_index}    15

Open Browser To App
    [Documentation]    Opens a new browser instance and navigates to the application URL.
    New Browser    headless=${HEADLESS}
    # Opens a new browser page and navigates to the application URL specified by ${APP_URL}.
    New Page    ${APP_URL}

# Ensures that the dropdown element is currently open and visible to the user. This keyword can be used to verify the state of dropdown menus before performing further actions or assertions.
Ensure Dropdown Is Open
    [Documentation]    Ensures that the chapter dropdown is open by checking its content visibility and clicking the drop button if it is not visible.
    ${is_open}=    Run Keyword And Return Status    Wait For Elements State    css=.dropdown-content.chapter-dropdown    visible    timeout=1s
    IF    not ${is_open}
        Click    css=.current-chapter-title > .dropdown-arrow
        Wait For Elements State    css=.dropdown-content.chapter-dropdown    visible
    END
# Selects a chapter by its index in the chapter list.
Select Chapter By Index
    [Arguments]    ${index}    ${timeout}=5s
    [Documentation]    Selects a chapter by its 0-based index in the chapter list. Converts the index to 1-based internally for CSS compatibility.
    ${css_index}=    Evaluate    ${index} + 1
    Wait For Elements State    css=.chapters-list>li:nth-child(${css_index})>.chapter-title-row>h4    visible    timeout=5s
    ${chapter}=    Get Element    css=.chapters-list>li:nth-child(${css_index})>.chapter-title-row>h4
    Click    ${chapter}
    #wait for a few seconds
    Sleep    ${timeout}

Validate Chapter Resource Link
    [Arguments]    ${index}    ${expected_text}    ${expected_url_fragment}
    [Documentation]    Validates that the chapter resource link at the specified index contains the expected text and URL fragment.
    ...                - `${index}`: The 1-based index of the resource link in the dropdown.
    ...                - `${expected_text}`: The expected text of the resource link.
    ...                - `${expected_url_fragment}`: The expected fragment of the URL for the resource
    Ensure Dropdown Is Open
    ${resource}=    Get Element   css=.dropdown-content.chapter-dropdown > .dropdown-item:nth-child(${index}) > a
    ${resource_text}=    Get Text    ${resource}
    Should Be Equal    ${resource_text}    ${expected_text}
    ${url}=    Get Attribute    css=.dropdown-content.chapter-dropdown > .dropdown-item:nth-child(${index}) > a    href
    Should Contain    ${url}    ${expected_url_fragment}

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
    ${first_chapter}=    Get Text    css=.chapters-list li:first-child h4
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
    Click   css=#sloka-list > div:nth-child(1) > ul > li:nth-child(1) > app-single-sloka > div
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
    Click    css=#sloka-list > div:nth-child(1) > ul > li:nth-child(3) > app-single-sloka > div
    Reload
    ${cookie}=    Get Cookie    currentSloka
    Should Be Equal    ${cookie.value}    2

Chapter URL Resources Are Valid
    [Tags]    smoke
    Ensure Dropdown Is Open
    ${css_selector}=    Set Variable    css=.dropdown-content.chapter-dropdown
    Wait For Elements State    ${css_selector}    visible    timeout=10s
    Print Html content    ${css_selector}    outerHTML
    ${resources}=    Get Elements    ${css_selector} > .dropdown-item
    Should Not Be Empty    ${resources}
    Length Should Be    ${resources}    3
    Validate Chapter Resource Link    1    Audio        slokastorage
    Validate Chapter Resource Link    2    PDF          slokastorage
    Validate Chapter Resource Link    3    Tamil PDF    tamil.pdf
