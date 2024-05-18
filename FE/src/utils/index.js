class Util{

    static generateRandomId() {
        const randomHex = Math.random().toString(16).substring(2, 15);
        const prefix = 'id-';
        return prefix + randomHex;
      }
      
    static formatNumber(str) {
        const num = parseInt(str);
        return num.toLocaleString('vi-VN');
      }

    static isEmpty(value) {
        return (typeof value === "undefined")
            || (typeof value === "string" && value.length === 0)
            || (typeof value === "number" && value === 0)
            || (typeof value === "boolean" && value === false)
            || ( value === null)
    }
    static validateEmail(email) {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };

    static FormatDate(dateString) {
        // HH:MM, DD/MM/YYYY 
        const date = new Date(dateString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return hours + ':' + minutes + ', ' + day + '/' + month + '/' + year;
    }
    
    static daysInMonth(year,month)
    {
        let day = new Date(year,month,0)
        return day.getDate()
    }
    static dateRight(year,month,day)
    {
        let newMonth=month
        let newYear=year
        let daysInCurrentMonth = this.daysInMonth(year,month)
        if(day>0)
        {
            let newDateInNextMonth= daysInCurrentMonth-day
            if(newDateInNextMonth<0)
            {
            newMonth ++
                if(newMonth>12)
                {
                    newYear ++
                    newMonth=1
                }
            return Math.abs(newDateInNextMonth) +'/'+ newMonth +'/'+ newYear
            }
        }
        else
        {
            newMonth--
            if(newMonth<1)
            {
                newYear--
                newMonth=12
            }
            let daysInPreviousMonth=this.daysInMonth(newYear,newMonth)
            let newDateInPreviousMonth=daysInPreviousMonth+day
            return newDateInPreviousMonth +'/'+ newMonth +'/'+ newYear
        }
        return day + '/'+ month + '/'+ year
    }

    static getFirstDayOfWeek(year,month,date) 
    {
        let start = 1  // tuần bắt đầu từ thứ 2
        let d = new Date(year,month-1,date)
        let day = d.getDay()
        let diff = d.getDate() - day + (start > day ? start - 7: start)
        //console.log('first:',diff)
        return this.dateRight(d.getFullYear(),d.getMonth()+1,diff)
    }

    static getLastDayOfWeek(year,month,date) 
    {
        let start = 1 // tuần bắt đầu từ thứ 2
        let d = new Date(year,month-1,date)
        let day = d.getDay()
        let diff = d.getDate() - day + (start > day ? start - 1 : 6 + start)
        //console.log('last:',diff)
        return this.dateRight(d.getFullYear(),d.getMonth()+1,diff)
    }

    static getWeekNumber(year,month,date) 
    {
        // Copy date so don't modify original
        let d = new Date(Date.UTC(year, month-1, date))
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7))
        // Get first day of year
        let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
        // Calculate full weeks to nearest Thursday
        let weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
        // Return array of year and week number
        return weekNo
    }

    static formatDate(dateString) {
        // Tạo một đối tượng Date từ chuỗi ngày tháng
        const date = new Date(dateString);
      
        // Lấy ngày, tháng và năm từ đối tượng Date
        const day = date.getDate();
        const month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
        const year = date.getFullYear();
      
        // Định dạng ngày tháng và trả về kết quả
        const formattedDate = `${day}/${month}/${year}`;
        return formattedDate;
      }

    static createAppointmentTimes(startTime, endTime, appointmentLength, breakLength) {
        // console.log(startTime, endTime)
        // Chuyển đổi giờ bắt đầu và giờ kết thúc thành số
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
      
        // Tính toán thời gian khám và thời gian nghỉ dựa trên số phút
        const appointmentDurations = {
          '0.25': 15,
          '0.5': 30,
          '0.75': 45,
          '1': 60,
          '1.25': 75,
          '1.5': 90,
          '2': 120,
        };
        const appointmentDuration = appointmentDurations[appointmentLength];
        // console.log("appointmentDuration",appointmentDuration)

        const breakDurations = {
          '0.167': 10,
          '0.333': 20,
          '0.5': 30,
          '0.75': 45,
          '1': 60,
        };
        const breakDuration = breakDurations[breakLength];
        // console.log("breakDuration",breakDuration)
        // Tạo danh sách các khoảng thời gian khám
        const appointmentTimes = [];
        let currentTime = new Date(0, 0, 0, startHour, startMinute);

        while (currentTime < new Date(0, 0, 0, endHour, endMinute)) {
            // Thêm khoảng thời gian khám hiện tại vào danh sách
            const appointmentStart = currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            currentTime = new Date(currentTime.getTime() + appointmentDuration * 60 * 1000);
            const appointmentEnd = currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            appointmentTimes.push(`${appointmentStart}-${appointmentEnd}`);

            // Thêm khoảng thời gian nghỉ vào danh sách (nếu có)
            if (breakDuration > 0) {
            currentTime = new Date(currentTime.getTime() + breakDuration * 60 * 1000);
            }
        }

        return appointmentTimes;
      }

      static isDateBeforeToday(date) {
        // Lấy ngày hiện tại
        const today = new Date();
      
        // Chuyển đổi ngày truyền vào thành kiểu Date
        const targetDate = new Date(date);
      
        // So sánh ngày truyền vào với ngày hiện tại
        return targetDate < today;
      }
      
      
      
}

export default Util
