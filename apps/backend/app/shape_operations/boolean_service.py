"""
Boolean Service - Perform boolean operations on paths
Converted from TypeScript BooleanService.ts
"""
from typing import List, Literal, Tuple
import re


class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y


BooleanOperation = Literal['union', 'subtract', 'intersect', 'exclude']


class BooleanService:
    """Service for performing boolean operations on paths"""
    
    def perform_boolean_operation(
        self,
        path1_data: str,
        path2_data: str,
        operation: BooleanOperation
    ) -> str:
        """
        Perform boolean operation on two paths
        Note: Full implementation would require a proper path library like paper.js
        This is a simplified version that returns the first path
        """
        # Simplified implementation without paper.js
        # In production, properly initialize paper.js or use a Python path library
        
        # For now, return the first path
        # Full implementation would use paper.js or similar:
        # path1 = Path(path1_data)
        # path2 = Path(path2_data)
        # result = path1[operation](path2)
        # return result.path_data
        
        return path1_data
    
    def parse_path_to_points(self, path_data: str) -> List[Point]:
        """Parse SVG path to points"""
        points = []
        commands = re.findall(r'[MLCQZmlcqz][^MLCQZmlcqz]*', path_data)
        
        if not commands:
            return points
        
        for command in commands:
            cmd_type = command[0].upper()
            coords_str = command[1:].strip()
            coords = [float(x) for x in re.split(r'[\s,]+', coords_str) if x]
            
            if cmd_type == 'M' or cmd_type == 'L':
                if len(coords) >= 2:
                    points.append(Point(coords[0], coords[1]))
            elif cmd_type == 'C':
                if len(coords) >= 6:
                    points.append(Point(coords[4], coords[5]))
            elif cmd_type == 'Q':
                if len(coords) >= 4:
                    points.append(Point(coords[2], coords[3]))
        
        return points
    
    def paths_intersect(self, path1_data: str, path2_data: str) -> bool:
        """Check if two paths intersect"""
        points1 = self.parse_path_to_points(path1_data)
        points2 = self.parse_path_to_points(path2_data)
        
        # Simplified intersection check
        # Check if any points are very close
        for p1 in points1:
            for p2 in points2:
                distance = ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5
                if distance < 1:
                    return True
        
        return False
    
    def union(self, path1_data: str, path2_data: str) -> str:
        """Union operation (combine paths)"""
        # Simplified: return first path
        return path1_data
    
    def subtract(self, path1_data: str, path2_data: str) -> str:
        """Subtract operation (cut second path from first)"""
        # Simplified: return first path
        return path1_data
    
    def intersect(self, path1_data: str, path2_data: str) -> str:
        """Intersect operation (keep only overlapping area)"""
        # Simplified: return first path
        return path1_data
    
    def exclude(self, path1_data: str, path2_data: str) -> str:
        """Exclude operation (keep only non-overlapping areas)"""
        # Simplified: return first path
        return path1_data


boolean_service = BooleanService()


