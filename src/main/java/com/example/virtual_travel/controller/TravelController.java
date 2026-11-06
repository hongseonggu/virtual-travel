package com.example.virtual_travel.controller;

import com.example.virtual_travel.dto.TravelRequestDto;
import com.example.virtual_travel.dto.TravelResponseDto;
import com.example.virtual_travel.service.TravelService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/travel")
@CrossOrigin(origins = "http://localhost:5173")
public class TravelController {

    private final TravelService travelService;

    public TravelController(TravelService travelService) {
        this.travelService = travelService;
    }

    @PostMapping("/generate")
    public TravelResponseDto generateTravel(@RequestBody TravelRequestDto requestDto) {
        return travelService.generateTravel(requestDto);
    }
}