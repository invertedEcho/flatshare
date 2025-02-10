import 'package:flatshare/const.dart';
import 'package:flatshare/models/task.dart';
import 'package:flutter/material.dart';

class TaskTypeSwitch extends StatefulWidget {
  const TaskTypeSwitch(
      {super.key,
      required this.selectedTaskType,
      required this.onTaskTypeSelect});

  final TaskType selectedTaskType;
  final Function(TaskType) onTaskTypeSelect;

  @override
  State<StatefulWidget> createState() => TaskTypeSwitchState();
}

class TaskTypeSwitchState extends State<TaskTypeSwitch> {
  @override
  void initState() {
    super.initState();
  }

  Color getBackgroundColor(bool isSelected, bool isDarkMode) {
    if (isSelected) {
      return Colors.blueAccent;
    } else {
      if (isDarkMode) {
        return Colors.grey[850]!;
      } else {
        return Colors.white;
      }
    }
  }

  Color getForegroundColor(bool isSelected, bool isDarkMode) {
    if (isDarkMode) {
      return Colors.white;
    } else {
      if (isSelected) {
        return Colors.white;
      } else {
        return Colors.black;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    var brightness = MediaQuery.of(context).platformBrightness;
    bool isDarkMode = brightness == Brightness.dark;

    return Row(
      children: [
        Expanded(
            child: ElevatedButton(
                style: ButtonStyle(
                    backgroundColor: WidgetStateProperty.all<Color>(
                        getBackgroundColor(
                            widget.selectedTaskType == TaskType.recurring,
                            isDarkMode)),
                    foregroundColor: WidgetStateProperty.all(getForegroundColor(
                        widget.selectedTaskType == TaskType.recurring,
                        isDarkMode)),
                    textStyle: WidgetStateProperty.all<TextStyle>(
                      TextStyle(
                        fontWeight:
                            widget.selectedTaskType == TaskType.recurring
                                ? FontWeight.bold
                                : FontWeight.normal,
                      ),
                    ),
                    shape: WidgetStateProperty.all(
                      RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    elevation: WidgetStateProperty.all(generalElevation)),
                onPressed: () {
                  widget.onTaskTypeSelect(TaskType.recurring);
                },
                child: const Text("Recurring Tasks"))),
        const SizedBox(width: 8),
        Expanded(
            child: ElevatedButton(
                style: ButtonStyle(
                    backgroundColor: WidgetStateProperty.all(getBackgroundColor(
                        widget.selectedTaskType == TaskType.oneOff,
                        isDarkMode)),
                    foregroundColor: WidgetStateProperty.all(getForegroundColor(
                        widget.selectedTaskType == TaskType.oneOff,
                        isDarkMode)),
                    textStyle: WidgetStateProperty.all<TextStyle>(
                      TextStyle(
                        fontWeight: widget.selectedTaskType == TaskType.oneOff
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                    ),
                    shape: WidgetStateProperty.all<RoundedRectangleBorder>(
                      RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    )),
                onPressed: () {
                  widget.onTaskTypeSelect(TaskType.oneOff);
                },
                child: const Text("One-Time Tasks"))),
      ],
    );
  }
}
