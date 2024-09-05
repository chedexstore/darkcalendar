document.addEventListener("DOMContentLoaded", () => {
    const calendarContainer = document.querySelector(".container");
    const calendar = document.getElementById("calendar");
    const calendarHeader = document.getElementById("calendar-header");
    const eventInput = document.getElementById("event-input");
    const addEventButton = document.getElementById("add-event");
    const eventList = document.getElementById("event-list");
    const reloadButton = document.getElementById("reload-button");
    const eventDialog = document.getElementById("event-dialog");
    const dialogDateSpan = document.getElementById("dialog-date");
    const dialogEventInput = document.getElementById("dialog-event-input");
    const dialogAddEventButton = document.getElementById("dialog-add-event");
    const dialogEventList = document.getElementById("dialog-event-list");
    const closeDialogButton = document.getElementById("close-dialog");

    let events = JSON.parse(localStorage.getItem('events')) || {};
    let month = new Date().getMonth();
    let year = new Date().getFullYear();
    const now = new Date();
    let selectedDate = null;

    // Constants for month names and background images
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const backgroundImages = [
        'url("images/jan.jpg")',
        'url("images/feb.jpg")',
        'url("images/mar.jpg")',
        'url("images/apr.jpg")',
        'url("images/may.jpg")',
        'url("images/jun.jpg")',
        'url("images/jul.jpg")',
        'url("images/aug.jpg")',
        'url("images/sep.jpg")',
        'url("images/oct.jpg")',
        'url("images/nov.jpg")',
        'url("images/dec.jpg")'
    ];

    function openDialog(date) {
        selectedDate = date;
        dialogDateSpan.textContent = date;
        renderDialogEvents(date);
        eventDialog.style.display = "flex";
        eventInput.placeholder = `Add event on ${date}`;
        eventInput.disabled = true; // Disable main input when dialog is open
    }

    function closeDialog() {
        eventDialog.style.display = "none";
        eventInput.disabled = false; // Re-enable main input when dialog is closed
    }

    function renderDialogEvents(date) {
        dialogEventList.innerHTML = '';
        if (events[date]) {
            events[date].forEach((event, index) => {
                const eventItem = document.createElement("li");
                eventItem.className = "dialog-event-item";
                eventItem.innerHTML = 
                    `<input type="checkbox" ${event.done ? 'checked' : ''} data-date="${date}" data-index="${index}" />
                     <span>${index + 1}. ${event.text}</span>
                     <button class="dialog-delete-event" data-date="${date}" data-index="${index}">x</button>`;
                dialogEventList.appendChild(eventItem);
            });
        }
    }

    function addDialogEvent() {
        if (selectedDate && dialogEventInput.value.trim()) {
            if (!events[selectedDate]) {
                events[selectedDate] = [];
            }
            events[selectedDate].push({ text: dialogEventInput.value.trim(), done: false, dueDate: selectedDate });
            localStorage.setItem('events', JSON.stringify(events));
            renderDialogEvents(selectedDate);
            dialogEventInput.value = '';
        }
    }

    calendar.addEventListener('click', (event) => {
        if (event.target.classList.contains('day') && !event.target.classList.contains('empty')) {
            const date = event.target.dataset.date;
            openDialog(date);
        }
    });

    dialogAddEventButton.addEventListener('click', addDialogEvent);

    dialogEventInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addDialogEvent();
        }
    });

    dialogEventList.addEventListener('click', (event) => {
        if (event.target.classList.contains('dialog-delete-event')) {
            const date = event.target.dataset.date;
            const index = event.target.dataset.index;
            events[date].splice(index, 1);
            if (events[date].length === 0) {
                delete events[date];
            }
            localStorage.setItem('events', JSON.stringify(events));
            renderDialogEvents(date);
        } else if (event.target.type === 'checkbox') {
            const date = event.target.dataset.date;
            const index = event.target.dataset.index;
            events[date][index].done = event.target.checked;
            localStorage.setItem('events', JSON.stringify(events));

            // Check if all checkboxes are checked
            if (events[date].every(event => event.done)) {
                // Stop the blinking reminder for the due date
                const dayElement = document.querySelector(`.day[data-date="${date}"]`);
                dayElement.classList.remove('due-event');
            }
        }
    });

    function loadCalendar() {
        calendar.innerHTML = ''; // Clear existing calendar

        const firstDay = new Date(year, month, 1).getDay(); // Day of the week for the first day of the month
        const lastDate = new Date(year, month + 1, 0).getDate(); // Last day of the month

        // Add empty slots for the days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const day = document.createElement('div');
            day.className = 'day empty'; // Add a class to denote empty slots
            calendar.appendChild(day);
        }

        // Add the days of the current month
        for (let i = 1; i <= lastDate; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            day.textContent = i;
            day.dataset.date = `${year}-${month + 1}-${i}`;

            // Highlight the current day
            if (i === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
                day.classList.add('current-day');
            }

            // Add due-event class if today is a due date
            if (events[day.dataset.date]) {
                day.classList.add('due-event');
            }

            calendar.appendChild(day);
        }

        updateHeader();
        updateBackgroundImage();
    }

    function formatDate(date) {
        const options = { month: 'short', day: '2-digit', year: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    function updateHeader() {
        const currentDate = new Date(year, month, now.getDate());
        calendarHeader.textContent = formatDate(currentDate);
    }

    function updateBackgroundImage() {
        document.body.style.backgroundImage = backgroundImages[month];
        document.body.style.backgroundSize = 'cover';
    }

    document.getElementById("prev-month").addEventListener('click', () => {
        if (month === 0) {
            month = 11;
            year--;
        } else {
            month--;
        }
        loadCalendar();
    });

    document.getElementById("next-month").addEventListener('click', () => {
        if (month === 11) {
            month = 0;
            year++;
        } else {
            month++;
        }
        loadCalendar();
    });

    document.getElementById("prev-year").addEventListener('click', () => {
        year--;
        loadCalendar();
    });

    document.getElementById("next-year").addEventListener('click', () => {
        year++;
        loadCalendar();
    });

    reloadButton.addEventListener('click', loadCalendar);

    closeDialogButton.addEventListener('click', closeDialog);

    function updateBlinking() {
        document.querySelectorAll(".day").forEach(day => {
            const date = day.dataset.date;
            if (events[date] && events[date].some(event => !event.done)) {
                day.classList.add("due-event");
            } else {
                day.classList.remove("due-event");
            }
        });
    }

    function renderEvents(date) {
        eventList.innerHTML = '';
        if (events[date]) {
            let allChecked = true;
            events[date].forEach((event, index) => {
                const eventItem = document.createElement("li");
                eventItem.className = "event-item";
                eventItem.innerHTML = `
                    <input type="checkbox" ${event.done ? 'checked' : ''} data-date="${date}" data-index="${index}" />
                    <span>${index + 1}. ${event.text}</span>
                    <button class="delete-event" data-date="${date}" data-index="${index}">x</button>
                `;
                eventList.appendChild(eventItem);
                if (!event.done) allChecked = false;
            });
            if (allChecked) {
                const dayElement = document.querySelector(`.day[data-date="${date}"]`);
                dayElement.classList.remove('due-event');
            } else {
                const dayElement = document.querySelector(`.day[data-date="${date}"]`);
                dayElement.classList.add('due-event');
            }
        }
    }

    function addEvent() {
        if (selectedDate && eventInput.value.trim()) {
            if (!events[selectedDate]) {
                events[selectedDate] = [];
            }
            events[selectedDate].push({ text: eventInput.value.trim(), done: false, dueDate: selectedDate });
            localStorage.setItem('events', JSON.stringify(events));
            renderEvents(selectedDate);
            eventInput.value = '';
            updateBlinking(); // Update blinking effect
        }
    }

    addEventButton.addEventListener('click', addEvent);

    eventInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addEvent();
        }
    });

    eventList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-event')) {
            const date = event.target.dataset.date;
            const index = event.target.dataset.index;
            events[date].splice(index, 1);
            if (events[date].length === 0) {
                delete events[date];
            }
            localStorage.setItem('events', JSON.stringify(events));
            renderEvents(date);
        } else if (event.target.type === 'checkbox') {
            const date = event.target.dataset.date;
            const index = event.target.dataset.index;
            events[date][index].done = event.target.checked;
            localStorage.setItem('events', JSON.stringify(events));
            renderEvents(date);
        }
    });

    function makeElementDraggable(el) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        el.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            el.style.top = (el.offsetTop - pos2) + "px";
            el.style.left = (el.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;

            // Save position to localStorage
            localStorage.setItem('calendarPosition', JSON.stringify({ left: el.offsetLeft, top: el.offsetTop }));
        }
    }

    makeElementDraggable(calendarContainer);

    // Load saved position
    const savedPosition = JSON.parse(localStorage.getItem('calendarPosition'));
    if (savedPosition) {
        calendarContainer.style.left = `${savedPosition.left}px`;
        calendarContainer.style.top = `${savedPosition.top}px`;
    }

    loadCalendar();

    function updateClock() {
        const clockElement = document.getElementById('clock');
        const timezoneElement = document.getElementById('timezone');
        const options = { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const now = new Intl.DateTimeFormat('en-US', options).format(new Date());
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        clockElement.textContent = now;
        timezoneElement.textContent = timezone;
    } 
    setInterval(updateClock, 1000);

    updateClock();       
});
