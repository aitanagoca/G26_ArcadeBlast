// Array of events
const events = [
    { year: 2024, month: 5, day: 5, description: "Internacional de Ms.PacMan" },
    { year: 2024, month: 5, day: 8, description: "Semis-Nacional de Pong" },
    { year: 2024, month: 5, day: 9, description: "Final-mundial Tetris" },
  ];
  
  let date = new Date(),
      currYear = date.getFullYear(),
      currMonth = date.getMonth(),
      daysTag = document.querySelector(".days"),
      currentDate = document.querySelector(".current-date"),
      prevNextIcon = document.querySelectorAll(".icons span"),
      eventBox = document.querySelector(".event-box");
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
    let liTag = "";
  
    for (let i = firstDayofMonth; i > 0; i--) {
      liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }
  
    for (let i = 1; i <= lastDateofMonth; i++) {
      let isToday = i === date.getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear() ? "active" : "";
      let isEvent = events.some(event => event.day === i && event.month === currMonth && event.year === currYear) ? "event" : "";
      liTag += `<li class="${isToday} ${isEvent}">${i}</li>`;
    }
  
    for (let i = lastDayofMonth; i < 6; i++) {
      liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }
  
    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;
  
    // Clear the event box
    eventBox.innerHTML = "";
  
    // Find the events for the current month and year
    const currentEvents = events.filter(event => event.month === currMonth && event.year === currYear);
  
    // Add the events to the event box
    currentEvents.forEach(event => {
      const eventElement = document.createElement("p");
      eventElement.textContent = `Event del ${event.day}: ${event.description}`;
      eventBox.appendChild(eventElement);
    });
  }
  
  renderCalendar();
  
  prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
      currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
  
      if(currMonth < 0 || currMonth > 11) {
        date = new Date(currYear, currMonth, new Date().getDate());
        currYear = date.getFullYear();
        currMonth = date.getMonth();
      } else {
        date = new Date();
      }
      renderCalendar();
    });
  });