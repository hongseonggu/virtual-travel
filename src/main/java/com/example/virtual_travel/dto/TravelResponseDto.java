package com.example.virtual_travel.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TravelResponseDto {
    private String storyText;   // Grok이 생성해 준 가상 여행 스토리 텍스트
    private String imageUrl;    // Grok이 생성해 준 풍경 이미지 URL
}