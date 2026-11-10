# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /app

COPY eSchool.slnx ./
COPY src/Shared/eSchool.SharedKernel/*.csproj ./src/Shared/eSchool.SharedKernel/
COPY src/Shared/eSchool.Infrastructure/*.csproj ./src/Shared/eSchool.Infrastructure/
COPY src/Modules/Identity/*.csproj ./src/Modules/Identity/
COPY src/Modules/Academics/*.csproj ./src/Modules/Academics/
COPY src/Modules/Students/*.csproj ./src/Modules/Students/
COPY src/Modules/Billing/*.csproj ./src/Modules/Billing/
COPY src/Modules/Accounting/*.csproj ./src/Modules/Accounting/
COPY src/Modules/Attendance/*.csproj ./src/Modules/Attendance/
COPY src/BackgroundWorkers/*.csproj ./src/BackgroundWorkers/
COPY src/eSchool.WebAPI/*.csproj ./src/eSchool.WebAPI/

RUN dotnet restore src/eSchool.WebAPI/eSchool.WebAPI.csproj

COPY . .
RUN dotnet publish src/eSchool.WebAPI/eSchool.WebAPI.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "eSchool.WebAPI.dll"]
