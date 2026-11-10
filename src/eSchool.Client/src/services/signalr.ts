import * as signalR from '@microsoft/signalr';

class SignalRManager {
  private counterConnection: signalR.HubConnection | null = null;
  private attendanceConnection: signalR.HubConnection | null = null;

  public async connectCounter(schoolId: string, onPaymentReceived: (data: unknown) => void) {
    try {
      this.counterConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5000/hubs/counter')
        .withAutomaticReconnect()
        .build();

      this.counterConnection.on('OnFeePaymentReceived', onPaymentReceived);

      await this.counterConnection.start();
      await this.counterConnection.invoke('JoinSchoolCounter', schoolId);
      console.log('[SignalR] Connected to CounterHub for school:', schoolId);
    } catch (err) {
      console.warn('[SignalR] CounterHub connection deferred:', err);
    }
  }

  public async connectAttendance(schoolId: string, onAttendanceUpdated: (data: unknown) => void) {
    try {
      this.attendanceConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5000/hubs/attendance')
        .withAutomaticReconnect()
        .build();

      this.attendanceConnection.on('OnAttendanceUpdated', onAttendanceUpdated);

      await this.attendanceConnection.start();
      await this.attendanceConnection.invoke('JoinSchoolAttendance', schoolId);
      console.log('[SignalR] Connected to AttendanceHub for school:', schoolId);
    } catch (err) {
      console.warn('[SignalR] AttendanceHub connection deferred:', err);
    }
  }

  public disconnect() {
    this.counterConnection?.stop();
    this.attendanceConnection?.stop();
  }
}

export const signalRService = new SignalRManager();
