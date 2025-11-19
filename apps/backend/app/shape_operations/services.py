"""
Shape Service - Generate shape paths and perform operations
Converted from TypeScript ShapeService.ts
"""
import math
from typing import List, Tuple, Literal


class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y


class ShapeConfig:
    def __init__(self, width: float, height: float, center_x: float, center_y: float):
        self.width = width
        self.height = height
        self.center_x = center_x
        self.center_y = center_y


class ShapeService:
    """Service for generating shape paths"""
    
    def generate_polygon_points(self, sides: int, config: ShapeConfig) -> List[Point]:
        """Generate polygon points"""
        points = []
        radius = min(config.width, config.height) / 2
        angle_step = (math.pi * 2) / sides
        start_angle = -math.pi / 2
        
        for i in range(sides):
            angle = start_angle + angle_step * i
            points.append(Point(
                config.center_x + radius * math.cos(angle),
                config.center_y + radius * math.sin(angle)
            ))
        
        return points
    
    def generate_star_points(self, points: int, inner_radius: float, config: ShapeConfig) -> List[Point]:
        """Generate star points"""
        star_points = []
        outer_radius = min(config.width, config.height) / 2
        inner_rad = outer_radius * inner_radius
        angle_step = math.pi / points
        start_angle = -math.pi / 2
        
        for i in range(points * 2):
            angle = start_angle + angle_step * i
            radius = outer_radius if i % 2 == 0 else inner_rad
            star_points.append(Point(
                config.center_x + radius * math.cos(angle),
                config.center_y + radius * math.sin(angle)
            ))
        
        return star_points
    
    def generate_arrow_path(self, style: Literal['simple', 'double', 'curved', 'block'], config: ShapeConfig) -> str:
        """Generate arrow path"""
        width = config.width
        height = config.height
        center_x = config.center_x
        center_y = config.center_y
        start_x = center_x - width / 2
        end_x = center_x + width / 2
        mid_y = center_y
        arrow_width = height * 0.3
        head_width = height
        head_length = min(width * 0.3, height)
        
        if style == 'simple':
            return f"M {start_x} {mid_y} L {end_x - head_length} {mid_y} L {end_x - head_length} {mid_y - head_width / 2} L {end_x} {mid_y} L {end_x - head_length} {mid_y + head_width / 2} L {end_x - head_length} {mid_y} Z"
        elif style == 'double':
            return f"M {start_x} {mid_y} L {start_x + head_length} {mid_y - head_width / 2} L {start_x + head_length} {mid_y - arrow_width / 2} L {end_x - head_length} {mid_y - arrow_width / 2} L {end_x - head_length} {mid_y - head_width / 2} L {end_x} {mid_y} L {end_x - head_length} {mid_y + head_width / 2} L {end_x - head_length} {mid_y + arrow_width / 2} L {start_x + head_length} {mid_y + arrow_width / 2} L {start_x + head_length} {mid_y + head_width / 2} Z"
        elif style == 'curved':
            control_y = mid_y - height * 0.5
            return f"M {start_x} {mid_y} Q {center_x} {control_y} {end_x - head_length} {mid_y} L {end_x - head_length} {mid_y - head_width / 2} L {end_x} {mid_y} L {end_x - head_length} {mid_y + head_width / 2} L {end_x - head_length} {mid_y} Z"
        elif style == 'block':
            return f"M {start_x} {mid_y - arrow_width / 2} L {end_x - head_length} {mid_y - arrow_width / 2} L {end_x - head_length} {mid_y - head_width / 2} L {end_x} {mid_y} L {end_x - head_length} {mid_y + head_width / 2} L {end_x - head_length} {mid_y + arrow_width / 2} L {start_x} {mid_y + arrow_width / 2} Z"
        else:
            return self.generate_arrow_path('simple', config)
    
    def generate_callout_path(
        self,
        style: Literal['rounded', 'sharp', 'cloud', 'speech'],
        config: ShapeConfig,
        tail_position: float = 0.5
    ) -> str:
        """Generate callout path"""
        width = config.width
        height = config.height
        center_x = config.center_x
        center_y = config.center_y
        left = center_x - width / 2
        right = center_x + width / 2
        top = center_y - height / 2
        bottom = center_y + height / 2
        tail_height = height * 0.3
        tail_width = width * 0.15
        tail_x = left + width * tail_position
        
        if style == 'rounded':
            radius = min(width, height) * 0.1
            return f"M {left + radius} {top} L {right - radius} {top} Q {right} {top} {right} {top + radius} L {right} {bottom - radius} Q {right} {bottom} {right - radius} {bottom} L {tail_x + tail_width} {bottom} L {tail_x} {bottom + tail_height} L {tail_x - tail_width} {bottom} L {left + radius} {bottom} Q {left} {bottom} {left} {bottom - radius} L {left} {top + radius} Q {left} {top} {left + radius} {top} Z"
        elif style == 'sharp':
            return f"M {left} {top} L {right} {top} L {right} {bottom} L {tail_x + tail_width} {bottom} L {tail_x} {bottom + tail_height} L {tail_x - tail_width} {bottom} L {left} {bottom} Z"
        else:  # cloud or speech
            corner_radius = min(width, height) * 0.15
            return f"M {left + corner_radius} {top} L {right - corner_radius} {top} Q {right} {top} {right} {top + corner_radius} L {right} {bottom - corner_radius} Q {right} {bottom} {right - corner_radius} {bottom} L {tail_x + tail_width * 2} {bottom} L {tail_x} {bottom + tail_height} L {tail_x - tail_width} {bottom} L {left + corner_radius} {bottom} Q {left} {bottom} {left} {bottom - corner_radius} L {left} {top + corner_radius} Q {left} {top} {left + corner_radius} {top} Z"
    
    def generate_heart_path(self, config: ShapeConfig) -> str:
        """Generate heart path"""
        width = config.width
        height = config.height
        center_x = config.center_x
        center_y = config.center_y
        
        x = center_x - width / 2
        y = center_y - height / 2
        w = width
        h = height
        
        top_center_x = x + w / 2
        top_center_y = y + h / 5
        bottom_x = x + w / 2
        bottom_y = y + h
        
        left_top_x = x
        left_top_y = y
        left_mid_x = x
        left_mid_y = y + h / 3
        
        right_top_x = x + w
        right_top_y = y
        right_mid_x = x + w
        right_mid_y = y + h / 3
        
        return f"M {top_center_x} {top_center_y} C {top_center_x} {y}, {left_top_x} {y}, {left_top_x} {left_mid_y} C {left_top_x} {y + (2 * h) / 3}, {bottom_x} {bottom_y}, {bottom_x} {bottom_y} C {bottom_x} {bottom_y}, {right_top_x} {y + (2 * h) / 3}, {right_top_x} {right_mid_y} C {right_top_x} {y}, {top_center_x} {y}, {top_center_x} {top_center_y} Z"
    
    def generate_gear_path(self, teeth: int, config: ShapeConfig) -> str:
        """Generate gear path"""
        center_x = config.center_x
        center_y = config.center_y
        outer_radius = min(config.width, config.height) / 2
        inner_radius = outer_radius * 0.7
        angle_step = (math.pi * 2) / teeth
        
        path = ""
        
        for i in range(teeth):
            angle = angle_step * i
            next_angle = angle_step * (i + 1)
            
            inner_x1 = center_x + inner_radius * math.cos(angle)
            inner_y1 = center_y + inner_radius * math.sin(angle)
            
            tooth_angle1 = angle + angle_step * 0.4
            tooth_angle2 = angle + angle_step * 0.6
            tooth_x1 = center_x + outer_radius * math.cos(tooth_angle1)
            tooth_y1 = center_y + outer_radius * math.sin(tooth_angle1)
            tooth_x2 = center_x + outer_radius * math.cos(tooth_angle2)
            tooth_y2 = center_y + outer_radius * math.sin(tooth_angle2)
            
            if i == 0:
                path += f"M {inner_x1} {inner_y1}"
            
            next_inner_x = center_x + inner_radius * math.cos(next_angle)
            next_inner_y = center_y + inner_radius * math.sin(next_angle)
            path += f" L {tooth_x1} {tooth_y1} L {tooth_x2} {tooth_y2} L {next_inner_x} {next_inner_y}"
        
        path += " Z"
        return path
    
    def points_to_path(self, points: List[Point], closed: bool = True) -> str:
        """Convert points to SVG path"""
        if not points:
            return ""
        
        path = f"M {points[0].x} {points[0].y}"
        
        for i in range(1, len(points)):
            path += f" L {points[i].x} {points[i].y}"
        
        if closed:
            path += " Z"
        
        return path
    
    def simplify_path(self, path_data: str, tolerance: float = 1.0) -> str:
        """Simplify path (simplified implementation)"""
        # In production, use proper path simplification algorithms
        return path_data
    
    def smooth_path(self, path_data: str, smoothness: float = 0.3) -> str:
        """Smooth path (simplified implementation)"""
        # In production, use bezier curve smoothing
        return path_data


shape_service = ShapeService()


