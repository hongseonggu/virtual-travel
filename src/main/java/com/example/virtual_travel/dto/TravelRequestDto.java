package com.example.virtual_travel.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TravelRequestDto {
    private String prompt;      // 유저가 입력한 가상 여행지 및 테마 (예: "사이버펑크 네온사인 서울")
    private String style;       // 이미지 스타일 옵션 (예: 판타지, 실사, 애니메이션 등)
}