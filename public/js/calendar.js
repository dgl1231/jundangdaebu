const date = new Date();

const renderCalendar = () => {

    date.setDate(1);

    const year = String(date.getFullYear());

    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

    const firstDayIndex = date.getDay();

    const lastDayIndex = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay();

    const nextDays = 7 - lastDayIndex - 1;

    for (let l = 0; l < year.length; l++) {
        document.getElementById('year' + l).innerHTML = year.substr(l, 1);
    }

    document.querySelector('.calendar_title_month').innerHTML = date.getMonth() + 1;

    let days = "";

    alert(firstDayIndex);
    for (let x = firstDayIndex; x > 0; x--) {
        days += `<div class="prev-date">${prevLastDay - x + 1}</div>`;
    }

    for (let i = 1; i <= lastDay; i++) {
        if (i === new Date().getDate() && date.getMonth() === new Date().getMonth()) {
            days += `<div class="today">${i}</div>`;
        } else {
            days += `<div>${i}</div>`;
        }
    }

    for (let j = 1; j <= nextDays; j++) {
        days += `<div class="next-date">${j}</div>`;
    }

    document.querySelector('.calendar_date').innerHTML = days;

};

document.querySelector('.calendar_month_prev_btn').addEventListener('click',
    () => {
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
        //document.querySelector('.calendar_title_month').innerHTML = date
        //  .getMonth() + 1;
    });

document.querySelector('.calendar_month_next_btn').addEventListener('click',
    () => {
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
        //document.querySelector('.calendar_title_month').innerHTML = date
        //  .getMonth() + 1;
    });

renderCalendar();