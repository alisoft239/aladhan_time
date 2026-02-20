document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("location-form");
  const cityInput = document.getElementById("city");
  const countryInput = document.getElementById("country");
  const prayerTimesDiv = document.getElementById("prayer-times");

  // Load saved location and cached times
  const savedCity = localStorage.getItem("prayerCity");
  const savedCountry = localStorage.getItem("prayerCountry");
  const savedDate = localStorage.getItem("prayerDate");
  const savedTimings = localStorage.getItem("prayerTimings");
  const today = new Date().toISOString().split("T")[0];
  if (savedCity && savedCountry) {
    cityInput.value = savedCity;
    countryInput.value = savedCountry;
    if (savedDate === today && savedTimings) {
      prayerTimesDiv.innerHTML = savedTimings;
    } else {
      fetchPrayerTimes(savedCity, savedCountry);
    }
  }

  // Form submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    const country = countryInput.value.trim();
    if (city && country) {
      localStorage.setItem("prayerCity", city);
      localStorage.setItem("prayerCountry", country);
      fetchPrayerTimes(city, country);
    }
  });

  async function fetchPrayerTimes(city, country) {
    prayerTimesDiv.innerHTML = "<p>جاري التحميل...</p>";
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=8`,
      );
      const data = await response.json();
      if (data.code === 200) {
        const timings = data.data.timings;
        const date = data.data.date.readable;
        prayerTimesDiv.innerHTML = `
                    <h2>مواقيت الصلاة لـ ${city}, ${country}</h2>
                    <p>التاريخ: ${date}</p>
                    <ul>
                        <li>الفجر: ${timings.Fajr}</li>
                        <li>الظهر: ${timings.Dhuhr}</li>
                        <li>العصر: ${timings.Asr}</li>
                        <li>المغرب: ${timings.Maghrib}</li>
                        <li>العشاء: ${timings.Isha}</li>
                    </ul>
                `;
        localStorage.setItem("prayerDate", data.data.date.gregorian.date);
        localStorage.setItem("prayerTimings", prayerTimesDiv.innerHTML);
      } else {
        prayerTimesDiv.innerHTML =
          "<p>خطأ في جلب البيانات. تحقق من المدينة والدولة.</p>";
      }
    } catch (error) {
      prayerTimesDiv.innerHTML = "<p>خطأ في الاتصال بالإنترنت.</p>";
    }
  }
});
