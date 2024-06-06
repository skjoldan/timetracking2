<template>
    <div>
        <select v-model="selectedMonth" @change="createMonth">
            <option v-for="month in months" :key="month" :value="month">
                {{ month }}
            </option>
        </select>

        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Lunch Break (min)</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(entry, index) in timeEntries" :key="index">
                    <td>{{ entry.date }}</td>
                    <td><input type="time" v-model="entry.startTime" @change="calculateTotal(index)"></td>
                    <td><input type="time" v-model="entry.endTime" @change="calculateTotal(index)"></td>
                    <td><input type="number" min="0" v-model.number="entry.lunch" @change="calculateTotal(index)"></td>
                    <td>{{ entry.total }}</td>
                </tr>
            </tbody>
        </table>

        <button @click="saveTimeEntries">Save</button>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            selectedMonth: null,
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            timeEntries: []
        };
    },
    methods: {
        createMonth() {
            const year = new Date().getFullYear();
            const monthIndex = this.months.indexOf(this.selectedMonth);
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
            
            this.timeEntries = Array.from({ length: daysInMonth }, (_, i) => ({
                date: new Date(year, monthIndex, i + 1).toISOString().slice(0,10),
                startTime: '',
                endTime: '',
                lunch: 0,
                total: 0
            }));
        },
        calculateTotal(index) {
            if (!this.timeEntries[index].startTime || !this.timeEntries[index].endTime) {
                return;
            }

            const start = new Date(`1970-01-01T${this.timeEntries[index].startTime}Z`);
            const end = new Date(`1970-01-01T${this.timeEntries[index].endTime}Z`);
            const total = end - start - (this.timeEntries[index].lunch * 60 * 1000);
            this.timeEntries[index].total = total / (60 * 60 * 1000);
        },
        saveTimeEntries() {
            const entriesToSave = this.timeEntries.filter(entry => entry.total > 0);

            console.log("entriesToSave:", entriesToSave);

            if (entriesToSave.length > 0) {
                axios.post('http://localhost:3000/add-entry', entriesToSave)
                    .then(response => console.log(response))
                    .catch(error => console.log(error));
            } else {
                console.log("No entries with total time to save.");
            }
        }
    }
}
</script>
