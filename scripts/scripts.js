/* ============================================================
   WEB NOVEL STATIC SITE
   Chapter Navigation
=============================================================== */

/* ============================================================
   CONFIGURATION
=============================================================== */

/*
    ============================================================
    MAIN STORY
    ============================================================

    Main story files are stored in:

        chapters/main_story/

    And use the filename format:

        ms_chapter_01.docx
        ms_chapter_02.docx
        ms_chapter_03.docx
        etc.
*/

const mainStoryChapterCount = 5;

const mainStoryPath = "chapters/main_story/";

const mainStoryFilename = "ms_chapter_{number}.docx";

/*
    ============================================================
    SIDE STORIES
    ============================================================

    Side story files are stored in:

        chapters/side_stories/

    And use the filename format:

        ss_chapter_01.docx
        ss_chapter_02.docx
        ss_chapter_03.docx
        etc.

    Side story titles will NOT be read from the DOCX.

    They will simply appear as:

        Side Story 01
        Side Story 02
        Side Story 03
*/

const sideStoryChapterCount = 1;

const sideStoryPath = "chapters/side_stories/";

const sideStoryFilename = "ss_chapter_{number}.docx";

/* ============================================================
   DOM ELEMENTS
=============================================================== */

const chapterContent = document.getElementById("chapter-content");

const chapterSelector = document.getElementById("chapter-selector");

const previousChapterButton = document.getElementById("previous-chapter");

const nextChapterButton = document.getElementById("next-chapter");

const backToTopButton = document.getElementById("back-to-top");

/* ============================================================
   CHAPTER LIST
=============================================================== */

/*
    This array contains every actual chapter.

    Main Story chapters are added first.

    Side Stories are added afterward.

    Example:

        chapters[0]  = Main Story 01
        chapters[1]  = Main Story 02
        chapters[2]  = Main Story 03
        ...

        chapters[3] = Side Story 01
        chapters[4] = Side Story 02
        chapters[5] = Side Story 03
*/

const chapters = [];

/*
    The current chapter is represented by its
    position inside the chapters array.
*/

let currentChapter = 0;

/* ============================================================
   GET MAIN STORY TITLE
=============================================================== */

/*
    Reads the DOCX file and looks for the first <h1>.

    Mammoth converts a Word/LibreOffice Heading 1
    into an HTML <h1>.

    Example DOCX:

        Heading 1
        Chapter title

    becomes:

        <h1>Chapter title</h1>
*/

async function getMainStoryTitle(filepath, chapterNumber) {

    try {

        /*
            Fetch the DOCX file.
        */

        const response = await fetch(filepath);

        /*
            If the file cannot be found or loaded,
            return a normal fallback title.
        */

        if (!response.ok) {
            console.warn(
                `Unable to read chapter title from ${filepath}`
            );

            return `Chapter ${String(chapterNumber).padStart(2, "0")}`;
        }

        /*
            Read the DOCX as binary data.
        */

        const arrayBuffer = await response.arrayBuffer();

        /*
            Convert the DOCX into HTML.

            We only need the resulting HTML here
            so we can find the first <h1>.
        */

        const result = await mammoth.convertToHtml({arrayBuffer: arrayBuffer});

        /*
            Create a temporary HTML document
            from Mammoth's output.

            This lets us easily search for <h1>.
        */

        const temporaryDocument = new DOMParser().parseFromString(result.value, "text/html");

        /*
            Find the first Heading 1.
        */

        const heading = temporaryDocument.querySelector("h1");

        /*
            If an <h1> exists, use its text.

            Otherwise, fall back to:

                Chapter 01
                Chapter 02
                etc.
        */

        if (heading) {

            const title =
                heading.textContent.trim();

            if (title.length > 0) {

                return title;
            }
        }

        /*
            Fallback if the DOCX doesn't
            contain a Heading 1.
        */

        return `Chapter ${String(chapterNumber).padStart(2, "0")}`;

    }

    catch (error) {

        /*
            Don't let one failed title
            prevent the entire website
            from loading.
        */

        console.warn(`Unable to read title for ${filepath}:`, error);

        /*
            Use the normal chapter number
            as a fallback.
        */

        return `Chapter ${String(chapterNumber).padStart(2, "0")}`;
    }
}

/* ============================================================
   GENERATE CHAPTER LIST
=============================================================== */

/*
    This function is async because it needs to
    read the Main Story DOCX files to discover
    their titles.
*/

async function generateChapterList() {

    /*
        Clear the chapter array.

        This prevents duplicate entries if
        this function is ever called again.
    */

    chapters.length = 0;

    /*
        Clear the combobox.
    */

    chapterSelector.innerHTML = "";

    /* ========================================================
       MAIN STORY
    =========================================================== */


    for (
        let chapterNumber = 1;
        chapterNumber <= mainStoryChapterCount;
        chapterNumber++
    ) {

        /*
            Convert the chapter number into
            a two-digit number.

            1  → "01"
            2  → "02"
            9  → "09"
            10 → "10"
        */

        const paddedNumber = String(chapterNumber).padStart(2, "0");

        /*
            Create the filename.

            Example:

                ms_chapter_01.docx
        */

        const filename = mainStoryFilename.replace("{number}", paddedNumber);

        /*
            Create the complete filepath.

            Example:

                chapters/main_story/ms_chapter_01.docx
        */

        const filepath = mainStoryPath + filename;

        /*
            Read the title from the DOCX.
        */

        const chapterTitle = await getMainStoryTitle(filepath, chapterNumber);

        /*
            Create the text that will appear
            in the combobox.

            Example:

                Chapter 01 - An Educated Interest
        */

        const displayTitle = `Chapter ${paddedNumber} - ${chapterTitle}`;

        /*
            Store the chapter information.
        */

        chapters.push({

            type: "main",
            number: chapterNumber,
            title: displayTitle,
            filepath: filepath

        });

        /*
            Create the <option>.
        */

        const option = document.createElement("option");

        /*
            What the reader sees.
        */

        option.textContent = displayTitle;

        /*
            Store the chapter's position
            inside the chapters array.
        */

        option.value = chapters.length - 1;

        /*
            Add the option to the combobox.
        */

        chapterSelector.appendChild(option);

    }

    /* ========================================================
       SIDE STORY SEPARATOR
    =========================================================== */

    /*
        Create a disabled option.

        This is just a visual separator.
    */

    const separator = document.createElement("option");


    separator.textContent = "──────── Side Stories ────────";

    separator.disabled = true;

    chapterSelector.appendChild(separator);

    /* ========================================================
       SIDE STORIES
    =========================================================== */

    for (
        let chapterNumber = 1;
        chapterNumber <= sideStoryChapterCount;
        chapterNumber++
    ) {

        /*
            Convert the chapter number into
            a two-digit number.
        */

        const paddedNumber = String(chapterNumber).padStart(2, "0");

        /*
            Create the filename.

            Example:

                ss_chapter_01.docx
        */

        const filename = sideStoryFilename.replace("{number}", paddedNumber);

        /*
            Create the complete filepath.
        */

        const filepath = sideStoryPath + filename;

        /*
            Side stories keep their simple names.

                Side Story 01
                Side Story 02
                Side Story 03
        */

        const displayTitle = `Side Story ${paddedNumber}`;

        /*
            Store the chapter information.
        */

        chapters.push({

            type: "side",
            number: chapterNumber,
            title: displayTitle,
            filepath: filepath

        });

        /*
            Create the <option>.
        */

        const option = document.createElement("option");

        /*
            What the reader sees.
        */

        option.textContent = displayTitle;

        /*
            Store the chapter's position
            inside the chapters array.
        */

        option.value = chapters.length - 1;

        /*
            Add the option to the combobox.
        */

        chapterSelector.appendChild(option);
    }
}

/* ============================================================
   LOAD CHAPTER
=============================================================== */

async function loadChapter(chapterIndex) {

    /*
        Make sure the requested chapter exists.
    */

    if (
        chapterIndex < 0 ||
        chapterIndex >= chapters.length
    ) {
        return;
    }

    /*
        Update the current chapter.
    */

    currentChapter = chapterIndex;

    /*
        Get the chapter information.
    */

    const chapter = chapters[currentChapter];

    /*
        Temporarily show a loading message.
    */

    chapterContent.innerHTML = `
        <p class="text-center">
            Loading chapter...
        </p>
    `;

    try {

        /*
            Fetch the DOCX file.
        */

        const response = await fetch(chapter.filepath);

        /*
            Check whether the request succeeded.
        */

        if (!response.ok) {

            throw new Error(
                `Unable to load ${chapter.filepath}`
            );
        }

        /*
            Read the DOCX as binary data.
        */

        const arrayBuffer = await response.arrayBuffer();

        /*
            Convert the DOCX into HTML.
        */

        const result = await mammoth.convertToHtml({arrayBuffer: arrayBuffer});

        /*
            Insert the generated HTML
            into the chapter container.
        */

        chapterContent.innerHTML = result.value;

        /*
            Show any Mammoth conversion
            messages in the console.

            These are not necessarily errors.
        */

        if (result.messages.length > 0) {

            console.warn("Mammoth conversion messages:", result.messages);
        }

        /*
            Select the current chapter
            in the combobox.
        */

        chapterSelector.value = String(currentChapter);

        /*
            Update the Previous / Next buttons.
        */

        updateNavigationButtons();

        /*
            Scroll back to the beginning
            of the chapter.
        */

        window.scrollTo({top: 0, behavior: "smooth"});

    }

    catch (error) {

        /*
            Show the error in the console.
        */

        console.error(error);

        /*
            Show a friendly error
            to the reader.
        */

        chapterContent.innerHTML = `
            <p class="text-danger text-center">
                Unable to load this chapter.
            </p>
        `;

        /*
            Keep the navigation buttons updated.
        */

        updateNavigationButtons();
    }
}


/* ============================================================
   UPDATE NAVIGATION BUTTONS
=============================================================== */

function updateNavigationButtons() {

    /*
        Disable Previous on the very first
        chapter in the entire list.
    */

    previousChapterButton.disabled = currentChapter === 0;

    /*
        Disable Next on the very last
        chapter in the entire list.
    */

    nextChapterButton.disabled = currentChapter === chapters.length - 1;
}

/* ============================================================
   PREVIOUS CHAPTER
=============================================================== */

function previousChapter() {

    /*
        Make sure we are not already
        at the first chapter.
    */

    if (currentChapter > 0) {loadChapter(currentChapter - 1);}
}

/* ============================================================
   NEXT CHAPTER
=============================================================== */

function nextChapter() {

    /*
        Make sure we are not already
        at the final chapter.
    */

    if (currentChapter < chapters.length - 1){
        loadChapter(currentChapter + 1);
    }
}

/* ============================================================
   CHAPTER SELECTOR
=============================================================== */

chapterSelector.addEventListener("change", function () {

        /*
            The selected option's value
            contains the chapter's position
            inside the chapters array.
        */

        const selectedChapter = Number(chapterSelector.value);

        /*
            Load the selected chapter.
        */

        loadChapter(selectedChapter);
    }
);

/* ============================================================
   NAVIGATION BUTTON EVENTS
=============================================================== */

previousChapterButton.addEventListener("click", previousChapter);

nextChapterButton.addEventListener("click", nextChapter);

/* ============================================================
   KEYBOARD NAVIGATION
=============================================================== */

document.addEventListener("keydown", function (event) {

        /*
            Left Arrow → Previous Chapter
        */

        if (event.key === "ArrowLeft") {
            previousChapter();
        }

        /*
            Right Arrow → Next Chapter
        */

        if (event.key === "ArrowRight") {
            nextChapter();
        }
    }
);

/* ============================================================
   BACK TO TOP NAVIGATION
=============================================================== */
backToTopButton.addEventListener(
    "click",
    function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);

window.addEventListener(
    "scroll",
    function () {
        if (window.scrollY > 400) {
            backToTopButton.classList.add("visible");
        } else {
            backToTopButton.classList.remove("visible");
        }
    }
);

/* ============================================================
   INITIALIZATION
=============================================================== */

/*
    Generate the complete chapter list.

    This has to finish first because we need
    to read the Main Story titles from the DOCX files.
*/

async function initialize() {

    /*
        Generate the chapter list.
    */

    await generateChapterList();

    /*
        Load Main Story Chapter 01.
    */

    loadChapter(0);
}

/*
    Start the website.
*/

initialize();