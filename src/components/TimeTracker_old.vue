

<template>
  <div class="time-tracker">
    <select v-model="selectedMonth">
      <option value="">Select Month</option>
      <option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</option>
    </select>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Lunch Break (Minutes)</th>
          <th>Total Work Time (Hours)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="date in datesInSelectedMonth" :key="date.toISOString()">
          <td>{{ date.toDateString() }}</td>
          <td><input type="time" v-model="timeEntries[date.toISOString()].startTime" placeholder="Start Time"></td>
          <td><input type="time" v-model="timeEntries[date.toISOString()].endTime" placeholder="End Time"></td>
          <td><input type="number" v-model="timeEntries[date.toISOString()].lunchBreak"
              placeholder="Lunch Break (in minutes)"></td>
          <td>{{ timeEntries[date.toISOString()].totalWorkTime || 0 }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">Total Work Time This Month</td>
          <td>{{ totalWorkTimeThisMonth }}</td>
        </tr>
      </tfoot>
    </table>
    <button @click="saveTimeEntries">Save</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      selectedMonth: '',
      timeEntries: {},
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
  },
  computed: {
    datesInSelectedMonth() {
      let dates = [];
      if (this.selectedMonth !== '') {
        let date = new Date(new Date().getFullYear(), this.selectedMonth, 1);
        while (date.getMonth() == this.selectedMonth) {
          dates.push(new Date(date));
          date.setDate(date.getDate() + 1);
        }
      }
      return dates;
    },
    totalWorkTimeThisMonth() {
      let total = 0;
      for (let date of this.datesInSelectedMonth) {
        total += this.timeEntries[date.toISOString()]?.totalWorkTime || 0;
      }
      return total;
    }
  },
  watch: {
    datesInSelectedMonth(newDates) {
      for (let date of newDates) {
        let isoDate = date.toISOString();
        if (!this.timeEntries[isoDate]) {
          this.timeEntries[isoDate] = {
            startTime: null,
            endTime: null,
            lunchBreak: 0,
            totalWorkTime: 0
          };
        }
      }
    },
    timeEntries: {
      handler() {
        for (let date of this.datesInSelectedMonth) {
          this.calculateWorkTime(date);
        }
      },
      deep: true
    }
  },
  methods: {
    calculateWorkTime(date) {
      let entry = this.timeEntries[date.toISOString()] || { startTime: null, endTime: null, lunchBreak: 0 };

      if (entry.startTime && entry.endTime) {
        let start = new Date(`1970-01-01T${entry.startTime}Z`);
        let end = new Date(`1970-01-01T${entry.endTime}Z`);

        let totalHours = (end - start) / (1000 * 60 * 60); // Convert ms to hours
        let lunchHours = entry.lunchBreak / 60; // Convert minutes to hours

        this.timeEntries[date.toISOString()].totalWorkTime = totalHours - lunchHours;
      }
    },
    saveTimeEntries() {
        console.log("saveTimeEntries called."); // This line
        const entriesToSave = this.timeEntries.filter(entry => entry.total > 0);
        console.log("entriesToSave:", entriesToSave); // And this line

        if (entriesToSave.length > 0) {
            axios.post('http://localhost:3000/add-entry', entriesToSave)
                .then(response => console.log(response))
                .catch(error => console.log(error));
        } else {
            console.log("No entries with total time to save.");
        }
    
}


  }
};
</script>

<style scoped>
/* Your CSS styles go here */
</style>
