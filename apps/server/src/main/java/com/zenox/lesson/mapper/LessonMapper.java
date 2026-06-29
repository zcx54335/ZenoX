package com.zenox.lesson.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.lesson.entity.Lesson;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LessonMapper extends BaseMapper<Lesson> {
}
