package com.example.virtual_travel.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class TravelRequestDto {
    private String prompt;
    private String previousStory;
    private int currentMoney;
    private String currentTime;
    private String currentLocation; // 추가: 현재 위치
    private String currentWeather;  // 추가: 현재 날씨

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getPreviousStory() { return previousStory; }
    public void setPreviousStory(String previousStory) { this.previousStory = previousStory; }

    public int getCurrentMoney() { return currentMoney; }
    public void setCurrentMoney(int currentMoney) { this.currentMoney = currentMoney; }

    public String getCurrentTime() { return currentTime; }
    public void setCurrentTime(String currentTime) { this.currentTime = currentTime; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getCurrentWeather() { return currentWeather; }
    public void setCurrentWeather(String currentWeather) { this.currentWeather = currentWeather; }
}