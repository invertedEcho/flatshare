import 'package:flatshare/const.dart';
import 'package:flatshare/widgets/expense-tracker/expense_tracker.dart';
import 'package:flutter/material.dart';

class PageSwitch extends StatefulWidget {
  const PageSwitch(
      {super.key, required this.selectedPage, required this.onPageSelect});

  final PageType selectedPage;
  final Function(PageType) onPageSelect;

  @override
  State<StatefulWidget> createState() => PageSwitchState();
}

class PageSwitchState extends State<PageSwitch> {
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
                            widget.selectedPage == PageType.overview,
                            isDarkMode)),
                    foregroundColor: WidgetStateProperty.all(getForegroundColor(
                        widget.selectedPage == PageType.overview, isDarkMode)),
                    textStyle: WidgetStateProperty.all<TextStyle>(
                      TextStyle(
                        fontWeight: widget.selectedPage == PageType.overview
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
                  widget.onPageSelect(PageType.overview);
                },
                child: const Text("Overview"))),
        const SizedBox(width: 8),
        Expanded(
            child: ElevatedButton(
                style: ButtonStyle(
                    backgroundColor: WidgetStateProperty.all(getBackgroundColor(
                        widget.selectedPage == PageType.list, isDarkMode)),
                    foregroundColor: WidgetStateProperty.all(getForegroundColor(
                        widget.selectedPage == PageType.list, isDarkMode)),
                    textStyle: WidgetStateProperty.all<TextStyle>(
                      TextStyle(
                        fontWeight: widget.selectedPage == PageType.list
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
                  widget.onPageSelect(PageType.list);
                },
                child: const Text("List"))),
      ],
    );
  }
}
