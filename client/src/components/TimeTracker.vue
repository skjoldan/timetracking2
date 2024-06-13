<template>
    <div>
      <select v-model="selectedMonth" @change="createMonth" class="form-select mb-3 border rounded px-4 py-2">
        <option v-for="(month, index) in months" :key="index" :value="index + 1">
          {{ month }}
        </option>
      </select>
  
      <table class="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-300 px-4 py-2">Date</th>
            <th class="border border-gray-300 px-4 py-2">Start Time</th>
            <th class="border border-gray-300 px-4 py-2">End Time</th>
            <th class="border border-gray-300 px-4 py-2">Lunch Break (min)</th>
            <th class="border border-gray-300 px-4 py-2">Total (hours)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in timeEntries" :key="index" class="border-b">
            <td class="border border-gray-300 px-4 py-2">{{ entry.date }}</td>
            <td class="border border-gray-300 px-4 py-2">
              <input type="time" v-model="entry.startTime" @change="calculateTotal(index)" class="form-input border rounded px-4 py-2">
            </td>
            <td class="border border-gray-300 px-4 py-2">
              <input type="time" v-model="entry.endTime" @change="calculateTotal(index)" class="form-input border rounded px-4 py-2">
            </td>
            <td class="border border-gray-300 px-4 py-2">
              <input type="number" min="0" v-model.number="entry.lunch" @change="calculateTotal(index)" class="form-input border rounded px-4 py-2">
            </td>
            <td class="border border-gray-300 px-4 py-2">{{ entry.total }}</td>
          </tr>
        </tbody>
      </table>
  
      <button @click="saveTimeEntries" class="bg-green-500 text-white px-4 py-2 rounded mt-3">Save</button>
      <button @click="downloadPDF" class="bg-gray-500 text-white px-4 py-2 rounded mt-3 ml-3">Download PDF</button>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import jsPDF from 'jspdf';
  import 'jspdf-autotable';
  
  export default {
    data() {
      return {
        selectedMonth: null,
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        timeEntries: [],
        token: localStorage.getItem('token') || ''
      };
    },
    methods: {
      async createMonth() {
        const year = new Date().getFullYear();
        const monthIndex = this.selectedMonth;
  
        this.timeEntries = []; // Clear existing entries
  
        try {
          // Fetch saved entries for the selected month
          const response = await axios.get(`http://localhost:3000/get-entries`, {
            headers: { Authorization: `Bearer ${this.token}` },
            params: {
              year,
              month: monthIndex.toString().padStart(2, '0') // Ensure month is two digits
            }
          });
  
          const savedEntries = response.data;
          console.log('Saved Entries:', savedEntries);
  
          const daysInMonth = new Date(year, monthIndex, 0).getDate();
          
          this.timeEntries = Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, monthIndex - 1, i + 1).toISOString().slice(0, 10);
            const savedEntry = savedEntries.find(entry => entry.Date === date);
            console.log('Date:', date, 'Saved Entry:', savedEntry);
            return savedEntry
              ? {
                  date: savedEntry.Date,
                  startTime: savedEntry.StartTime.slice(0, 5),
                  endTime: savedEntry.EndTime.slice(0, 5),
                  lunch: savedEntry.LunchTime,
                  total: savedEntry.Total
                }
              : { date, startTime: '', endTime: '', lunch: 0, total: 0 };
          });
        } catch (error) {
          console.error('Error fetching saved entries:', error);
        }
      },
      calculateTotal(index) {
        const entry = this.timeEntries[index];
        if (!entry.startTime || !entry.endTime) {
          entry.total = 0;
          return;
        }
  
        const start = new Date(`1970-01-01T${entry.startTime}:00`);
        const end = new Date(`1970-01-01T${entry.endTime}:00`);
  
        if (end < start) {
          entry.total = 0;
          return;
        }
  
        const totalMilliseconds = (end - start) - (entry.lunch * 60 * 1000);
        entry.total = (totalMilliseconds / (60 * 60 * 1000)).toFixed(2); // converting milliseconds to hours and rounding to 2 decimals
      },
      async saveTimeEntries() {
        const entriesToSave = this.timeEntries.filter(entry => entry.total > 0);
  
        if (entriesToSave.length > 0) {
          try {
            const response = await axios.post('http://localhost:3000/add-entry', entriesToSave, {
              headers: { Authorization: `Bearer ${this.token}` }
            });
            if (response.data.status === 'OK') {
              alert('Entries submitted successfully!');
            } else {
              alert('Failed to submit entries');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('Error submitting entries');
          }
        } else {
          console.log("No entries with total time to save.");
        }
      },
      downloadPDF() {
        const doc = new jsPDF();
        doc.text('Timesheet', 20, 10);
  
        const columns = ["Date", "Start Time", "End Time", "Lunch Break (min)", "Total (hours)"];
        const rows = this.timeEntries.map(entry => [
          entry.date,
          entry.startTime,
          entry.endTime,
          entry.lunch,
          entry.total
        ]);
  
        doc.autoTable({
          head: [columns],
          body: rows,
          startY: 20
        });
  
        doc.save(`Timesheet_${this.months[this.selectedMonth - 1]}_${new Date().getFullYear()}.pdf`);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  