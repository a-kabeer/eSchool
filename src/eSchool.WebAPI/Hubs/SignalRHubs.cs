using Microsoft.AspNetCore.SignalR;

namespace eSchool.WebAPI.Hubs;

public class CounterHub : Hub
{
    public async Task JoinSchoolCounter(string schoolId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Counter_{schoolId}");
    }

    public async Task LeaveSchoolCounter(string schoolId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Counter_{schoolId}");
    }
}

public class AttendanceHub : Hub
{
    public async Task JoinSchoolAttendance(string schoolId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Attendance_{schoolId}");
    }
}

public class NotificationHub : Hub
{
    public async Task JoinUserChannel(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
    }
}
