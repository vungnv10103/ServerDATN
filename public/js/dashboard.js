document.addEventListener("DOMContentLoaded", function() {
  const txt_year = document.getElementById("revenue_year");
  const txt_month = document.getElementById("revenue_month");
  const to_input = document.getElementById("to_input");
  const save = document.getElementById("save");
  const from_input = document.getElementById("from_input");
  const select_year = document.getElementById("select_year");
  const logout = document.getElementById("logout");
  const BtnComfirmSale = document.getElementById("BtnComfirmSale");
  const TopNumberSale = document.getElementById("TopNumberSale");
  const BtnComfirmRunOut = document.getElementById("BtnComfirmRunOut");
  const TopNumberRunOut = document.getElementById("TopNumberRunOut");
  logout.addEventListener("click", function (){
    window.location.assign("/stech.manager/login");
    utils.DeleteAllCookies();
  });
  const date = new Date();
  let data_chart = [];
  async function getYearStatic(year_input) {
    try {
      const response = await axios.post(`/apiv2/getYearStatic`, {
        year_input: year_input
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  async function getStatic(startDate,endDate) {
    try {
      const response = await axios.post(`/apiv2/getStatic`, {
        startDate: startDate,
        endDate: endDate
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  async function GetHotSaleProducts(number) {
    try {
      const response = await axios.post(`/apiv2/getHotSaleProducts`, {
        topNumber: number
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  async function GetRunOutProducts(number) {
    try {
      const response = await axios.post(`/apiv2/getRunOutProducts`, {
        topNumber: number
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  function findMax(arr) {
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
      }
    }
    return max;
  }
  function calculateSum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }
  // function createArrayOfDates(startDate, endDate) {
  //   const dates = [];
  //   let currentDate = new Date(startDate);
  //
  //   while (currentDate <= endDate) {
  //     dates.push(currentDate.toLocaleDateString());
  //     currentDate.setDate(currentDate.getDate() + 1);
  //   }
  //   return dates;
  // }

  let chartCustom;
  const options = {month: 'numeric', day: 'numeric'};
  const options_full = { year: 'numeric', month: '2-digit', day: '2-digit' };

  function getCurrentMonthTime() {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const dates = [];
    let currentDateCopy = new Date(startDate);

    while (currentDateCopy <= endDate) {
      dates.push(new Date(currentDateCopy));
      currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }

    return dates;
  }

//Khởi tạo biến
  const oneMonthTime = getCurrentMonthTime();
  const formattedDates = oneMonthTime.map(date => date.toLocaleDateString('en-US', options_full));
  function FormatDate(array){
    array.map(date => date.toLocaleDateString('en-US', options));
  }

  from_input.addEventListener('change', function (){
    console.log(from_input.value);
  });

  to_input.addEventListener('change', function (){
    console.log(to_input.value);
  });
  function CustomStatic(from_input, to_input){
    getStatic(from_input, to_input).then(data =>{
      chartCustom = {
        series: [
          { name: "Earnings this day:", data: data.data },
        ],
        chart: {
          type: "bar",
          height: 345,
          offsetX: -15,
          toolbar: { show: true },
          foreColor: "#adb0bb",
          fontFamily: 'inherit',
          sparkline: { enabled: false },
        },
        colors: ["#e1a25b", "#49BEFF"],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "25%",
            borderRadius: [8],
            borderRadiusApplication: 'end',
            borderRadiusWhenStacked: 'all'
          },
        },
        markers: { size: 0 },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        grid: {
          borderColor: "rgba(0,0,0,0.1)",
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: false,
            },
          },
        },
        xaxis: {
          type: "category",
          categories: data.date,
          labels: {
            style: { cssClass: "grey--text lighten-2--text fill-color" },
          },
        },
        yaxis: {
          show: true,
          min: 0,
          max: findMax(data.data)+150,
          tickAmount: 4,
          labels: {
            style: {
              cssClass: "grey--text lighten-2--text fill-color",
            },
          },
        },
        stroke: {
          show: true,
          width: 3,
          lineCap: "butt",
          colors: ["transparent"],
        },
        tooltip: { theme: "light" },
        responsive: [
          {
            breakpoint: 600,
            options: {
              plotOptions: {
                bar: {
                  borderRadius: 3,
                }
              },
            }
          }
        ]
      };
      let chart_custom = new ApexCharts(document.querySelector("#chart_custom"), chartCustom);
      chart_custom.render().then(r =>{});
    });
  }
  save.addEventListener('click', function (){
    CustomStatic(from_input.value, to_input.value);
  });
  CustomStatic(formattedDates[0], formattedDates[formattedDates.length-1]);
  let dataSelect = ["2024", "2025", "2026"]
  dataSelect.forEach(date =>{
    let child = document.createElement("option")
    child.value = date
    child.text = date
    select_year.appendChild(child)
  })

  let year_selected = dataSelect[1];
  select_year.addEventListener('change', function (){
    year_selected = select_year.value;
    YearStatic(year_selected);
  });

  // let data_date = [];
  // const previousWeek = new Date(date);
  // previousWeek.setDate(previousWeek.getDate() - 6);
  // for (let i = 0; i < 7; i++) {
  //   const currentDate = new Date(previousWeek);
  //   currentDate.setDate(currentDate.getDate() + i);
  //   const formattedDate = currentDate.toLocaleDateString('en-US', options_full);
  //   data_date.push(formattedDate);
  // }
  // console.log(data_date)
  // const first_date = data_date[0];
  // const last_date = data_date[data_date.length - 1];
  function YearStatic(year_input){
    getYearStatic(year_input).then(data =>{
      if (data.code === 1){
        data_chart = data.data;
        console.log(data.data)
        console.log(data.date)
        let chartData = {
          series: [
            { name: "Earnings this day:", data: data_chart},
          ],
          chart: {
            type: "bar",
            height: 345,
            offsetX: -15,
            toolbar: { show: true },
            foreColor: "#adb0bb",
            fontFamily: 'inherit',
            sparkline: { enabled: false },
          },
          colors: ["#5D87FF", "#49BEFF"],
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "35%",
              borderRadius: [6],
              borderRadiusApplication: 'end',
              borderRadiusWhenStacked: 'all'
            },
          },
          markers: { size: 0 },
          dataLabels: {
            enabled: false,
          },
          legend: {
            show: false,
          },
          grid: {
            borderColor: "rgba(0,0,0,0.1)",
            strokeDashArray: 3,
            xaxis: {
              lines: {
                show: false,
              },
            },
          },
          xaxis: {
            type: "category",
            categories: data.date,
            labels: {
              style: { cssClass: "grey--text lighten-2--text fill-color" },
            },
          },
          yaxis: {
            show: true,
            min: 0,
            max: findMax(data_chart),
            tickAmount: 4,
            labels: {
              style: {
                cssClass: "grey--text lighten-2--text fill-color",
              },
            },
          },
          stroke: {
            show: true,
            width: 3,
            lineCap: "butt",
            colors: ["transparent"],
          },
          tooltip: { theme: "light" },
          responsive: [
            {
              breakpoint: 600,
              options: {
                plotOptions: {
                  bar: {
                    borderRadius: 3,
                  }
                },
              }
            }
          ]
        };

        let chart = new ApexCharts(document.querySelector("#chart"), chartData);
        chart.render().then(r => {});
      }else {
        console.log(data.message);
      }

    });
  }
  YearStatic(new Date().getFullYear());

//Thông kê doanh thu trong 1 năm
  //Tạo hàm rage ra 1 năm
  // function getYearTime(year) {
  //   const startDate = new Date(year, 0, 1);
  //   const endDate = new Date(year, 11, 31);
  //
  //   const days = [];
  //   let currentDateCopy = new Date(startDate);
  //
  //   while (currentDateCopy <= endDate) {
  //     days.push(new Date(currentDateCopy));
  //     currentDateCopy.setDate(currentDateCopy.getDate() + 1);
  //   }
  //
  //   return days;
  // }

//Khởi tạo biến
  const currentYear = new Date().getFullYear();
  // const yearTime = getYearTime(currentYear);
  // const formattedYear = yearTime.map(date => date.toLocaleDateString('en-US', options_full));
  let data_year = [];

  //Gọi API và render ra dữ liệu
  getYearStatic(currentYear).then(data =>{
    if (data.code === 1){
      data_year = data.data;
      let total = calculateSum(data_year);
      const formatted = total.toLocaleString('en-US', {
        style: 'currency',
        currency: 'VND'
      });
      txt_year.innerText = formatted.toString();
      let breakupData = {
        color: "#adb5bd",
        series: data_year,
        labels: data.date,
        chart: {
          width: 180,
          type: "donut",
          fontFamily: "Plus Jakarta Sans', sans-serif",
          foreColor: "#adb0bb",
        },
        plotOptions: {
          pie: {
            startAngle: 0,
            endAngle: 360,
            donut: {
              size: '75%',
            },
          },
        },
        stroke: {
          show: false,
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        colors: ["#5D87FF", "#ecf2ff", "#F9F9FD"],
        responsive: [
          {
            breakpoint: 991,
            options: {
              chart: {
                width: 150,
              },
            },
          },
        ],
        tooltip: {
          theme: "dark",
          fillSeriesColor: false,
        },
      };
      let breakupChart = new ApexCharts(document.querySelector("#breakup"), breakupData);
      breakupChart.render().then(r => {});
    }else {
      console.log(data.message);
    }
  });

//Thông kê doanh thu trong 1 tháng
  //Tạo hàm rage ra 1 tháng
  let data_month = [];

  //Gọi API và render ra dữ liệu
  getStatic(formattedDates[0], formattedDates[formattedDates.length - 1]).then(data =>{
    if (data.code === 1){
      data_month = data.data;
      let total = calculateSum(data_month);
      const formatted = total.toLocaleString('en-US', {
        style: 'currency',
        currency: 'VND'
      });
      txt_month.innerText = formatted.toString();
      let earningData = {
        chart: {
          id: "sparkline3",
          type: "area",
          height: 60,
          sparkline: {
            enabled: true,
          },
          group: "sparklines",
          fontFamily: "Plus Jakarta Sans', sans-serif",
          foreColor: "#adb0bb",
        },
        series: [
          {
            name: "Earnings",
            color: "#49BEFF",
            data: data_month,
          },
        ],
        stroke: {
          curve: "smooth",
          width: 2,
        },
        fill: {
          colors: ["#f3feff"],
          type: "solid",
          opacity: 0.05,
        },
        markers: {
          size: 0,
        },
        tooltip: {
          theme: "dark",
          fixed: {
            enabled: true,
            position: "right",
          },
          x: {
            show: false,
          },
        }
      };

      let earningChart = new ApexCharts(document.querySelector("#earning"), earningData);
      earningChart.render().then(r => {});
    }else {
      console.log(data.message);
    }
    });


  //Tạo bảng Sold out
  function SoldProducts(sold_number){
    GetRunOutProducts(sold_number).then(data =>{
      if (data.code === 1){
        // Dữ liệu cho các hàng
        const data_sold_out = data.data;

        // Lấy thẻ <tbody> trong bảng
        const tbodyElement = document.getElementById('TopSoldOutTable');

        // Tạo hàng cho mỗi phần tử trong mảng dữ liệu
        for (let i = 0; i < data_sold_out.length; i++) {
          const row = data_sold_out[i];

          // Tạo thẻ <tr> mới
          const trElement = document.createElement('tr');

          // Tạo thẻ <td> cho cột hình ảnh
          const imgTdElement = document.createElement('td');
          const imgElement = document.createElement('img');
          imgElement.classList.add('thumb-sm', 'rounded-circle', 'mr-2');
          imgElement.setAttribute('src', row.img_cover);
          imgElement.setAttribute('alt', '');
          imgTdElement.appendChild(imgElement);

          // Tạo thẻ <td> cho cột tên
          const nameTdElement = document.createElement('td');
          nameTdElement.textContent = row.name;

          // Tạo thẻ <td> cho cột thông số
          const specsTdElement = document.createElement('td');
          if (row.ram === null){
            row.ram = ""
          }else{
            row.ram = row.ram+" - "
          }
          if (row.rom === null){
            row.rom = ""
          }else{
            row.rom = row.rom+" - "
          }
          specsTdElement.textContent = row.ram+row.rom+row.color;

          // Tạo thẻ <td> cho cột số lượng bán ra
          const soldTdElement = document.createElement('td');
          soldTdElement.textContent = row.sold;

          // Tạo thẻ <td> cho cột số lượng
          const quantityTdElement = document.createElement('td');
          quantityTdElement.textContent = row.quantity;

          // Tạo thẻ <td> cho cột giá
          const priceTdElement = document.createElement('td');
          priceTdElement.textContent = row.price;

          // Tạo thẻ <td> cho cột trạng thái
          const statusTdElement = document.createElement('td');
          const statusSpanElement = document.createElement('span');
          if (row.quantity > 50){
            statusSpanElement.classList.add('badge', 'badge-boxed', 'badge-soft-primary');
          }else {
            statusSpanElement.classList.add('badge', 'badge-boxed', 'badge-soft-warning');
          }
          statusSpanElement.textContent = row.status;
          statusTdElement.appendChild(statusSpanElement);

          // Gắn các thẻ <td> vào thẻ <tr>
          trElement.appendChild(imgTdElement);
          trElement.appendChild(nameTdElement);
          trElement.appendChild(specsTdElement);
          trElement.appendChild(soldTdElement);
          trElement.appendChild(quantityTdElement);
          trElement.appendChild(priceTdElement);
          trElement.appendChild(statusTdElement);

          // Gắn thẻ <tr> vào thẻ <tbody>
          tbodyElement.appendChild(trElement);
        }
      }else {
        console.log(data.message);
      }
    });
  }
  //Tạo bảng Hot Sale
  function SaleProducts(sale_number){
    GetHotSaleProducts(sale_number).then(data_sale =>{
      if (data_sale.code === 1){
        // Dữ liệu cho các hàng
        const data_hot_sale = data_sale.data;

        // Lấy thẻ <tbody> trong bảng
        const tbodyElement = document.getElementById('TopSaleTable');

        // Tạo hàng cho mỗi phần tử trong mảng dữ liệu
        for (let i = 0; i < data_hot_sale.length; i++) {
          const row = data_hot_sale[i];

          // Tạo thẻ <tr> mới
          const trElement = document.createElement('tr');

          // Tạo thẻ <td> cho cột hình ảnh
          const imgTdElement = document.createElement('td');
          const imgElement = document.createElement('img');
          imgElement.classList.add('thumb-sm', 'rounded-circle', 'mr-2');
          imgElement.setAttribute('src', row.img_cover);
          imgElement.setAttribute('alt', '');
          imgTdElement.appendChild(imgElement);

          // Tạo thẻ <td> cho cột tên
          const nameTdElement = document.createElement('td');
          nameTdElement.textContent = row.name;

          // Tạo thẻ <td> cho cột thông số
          const specsTdElement = document.createElement('td');
          if (row.ram === null){
            row.ram = ""
          }else{
            row.ram = row.ram+" - "
          }
          if (row.rom === null){
            row.rom = ""
          }else{
            row.rom = row.rom+" - "
          }
          specsTdElement.textContent = row.ram+row.rom+row.color;

          // Tạo thẻ <td> cho cột số lượng bán ra
          const soldTdElement = document.createElement('td');
          soldTdElement.textContent = row.sold;

          // Tạo thẻ <td> cho cột số lượng
          const quantityTdElement = document.createElement('td');
          quantityTdElement.textContent = row.quantity;

          // Tạo thẻ <td> cho cột giá
          const priceTdElement = document.createElement('td');
          priceTdElement.textContent = row.price;

          // Tạo thẻ <td> cho cột trạng thái
          const statusTdElement = document.createElement('td');
          const statusSpanElement = document.createElement('span');
          if (row.quantity > 50){
            statusSpanElement.classList.add('badge', 'badge-boxed', 'badge-soft-primary');
          }else {
            statusSpanElement.classList.add('badge', 'badge-boxed', 'badge-soft-warning');
          }
          statusSpanElement.textContent = row.status;
          statusTdElement.appendChild(statusSpanElement);

          // Gắn các thẻ <td> vào thẻ <tr>
          trElement.appendChild(imgTdElement);
          trElement.appendChild(nameTdElement);
          trElement.appendChild(specsTdElement);
          trElement.appendChild(soldTdElement);
          trElement.appendChild(quantityTdElement);
          trElement.appendChild(priceTdElement);
          trElement.appendChild(statusTdElement);

          // Gắn thẻ <tr> vào thẻ <tbody>
          tbodyElement.appendChild(trElement);
        }
      }else {
        console.log(data.message);
      }
    });
  }
  SaleProducts(10);
  SoldProducts(10);
  function sanitizeInput(input) {
    // Loại bỏ các ký tự không phải số từ chuỗi đầu vào
    const sanitizedInput = input.replace(/\D/g, '');

    return sanitizedInput;
  }
  function removeTable(table){
    while (table.firstChild) {
      table.firstChild.remove();
    }
  }
  TopNumberSale.addEventListener('change', function () {
    sanitizeInput(this);
  });
  TopNumberRunOut.addEventListener('change', function () {
    sanitizeInput(this);
  });
  BtnComfirmSale.addEventListener('click', function () {
    if (TopNumberSale.value.trim().length !== 0) {
      const table = document.getElementById('TopSaleTable');
      removeTable(table);
      let sale_number = TopNumberSale.value;
      SaleProducts(sale_number);
    } else {
      utils.showMessage("Nhập số để tìm sản phẩm !")
    }
  });
  BtnComfirmRunOut.addEventListener('click', function () {
    if (TopNumberRunOut.value.trim().length !== 0) {
    const table = document.getElementById('TopSoldOutTable');
    removeTable(table);
    let sold_number = TopNumberRunOut.value;
    SoldProducts(sold_number);
    } else {
      utils.showMessage("Nhập số để tìm sản phẩm !")
    }
  });
  });